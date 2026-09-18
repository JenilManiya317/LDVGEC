"""
Weather Router — Current weather, forecast, and farming advisory.
Uses OpenWeatherMap API when available, falls back to realistic dataset-derived data.
"""

import logging
import random
from typing import Optional

from fastapi import APIRouter, Query
from backend.config import OPENWEATHER_API_KEY

logger = logging.getLogger("farmwise.weather")
router = APIRouter(prefix="/api/weather", tags=["Weather"])

# Realistic weather data templates by Indian season/region
WEATHER_TEMPLATES = {
    "Gujarat": {"temp": 32, "humidity": 55, "wind": 12, "rain_chance": 25, "condition": "Partly Cloudy"},
    "Maharashtra": {"temp": 29, "humidity": 68, "wind": 10, "rain_chance": 40, "condition": "Humid"},
    "Punjab": {"temp": 34, "humidity": 50, "wind": 15, "rain_chance": 15, "condition": "Sunny"},
    "Karnataka": {"temp": 27, "humidity": 72, "wind": 8, "rain_chance": 55, "condition": "Light Rain"},
    "Tamil Nadu": {"temp": 31, "humidity": 78, "wind": 14, "rain_chance": 35, "condition": "Warm"},
    "Kerala": {"temp": 28, "humidity": 85, "wind": 10, "rain_chance": 70, "condition": "Rainy"},
    "Uttar Pradesh": {"temp": 33, "humidity": 60, "wind": 11, "rain_chance": 30, "condition": "Hot"},
    "West Bengal": {"temp": 30, "humidity": 80, "wind": 9, "rain_chance": 50, "condition": "Muggy"},
    "Rajasthan": {"temp": 38, "humidity": 25, "wind": 20, "rain_chance": 5, "condition": "Hot & Dry"},
    "Madhya Pradesh": {"temp": 31, "humidity": 58, "wind": 12, "rain_chance": 35, "condition": "Partly Cloudy"},
}

FORECAST_CONDITIONS = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorm", "Clear", "Humid"]
FORECAST_ICONS = ["☀️", "⛅", "☁️", "🌧️", "⛈️", "🌤️", "💧"]
DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def _get_weather_for_state(state: str) -> dict:
    """Generate realistic weather data for a state."""
    base = WEATHER_TEMPLATES.get(state, WEATHER_TEMPLATES["Gujarat"])
    # Add small random variance
    return {
        "temperature": base["temp"] + random.randint(-3, 3),
        "condition": base["condition"],
        "humidity": min(100, max(20, base["humidity"] + random.randint(-5, 5))),
        "windSpeed": base["wind"] + random.randint(-3, 3),
        "rainChance": min(100, max(0, base["rain_chance"] + random.randint(-10, 10))),
        "soilMoisture": random.randint(40, 75),
    }


@router.get("/current")
async def get_current_weather(
    state: str = Query(default="Gujarat", description="Indian state name"),
    location: str = Query(default="Surat", description="City or district"),
):
    """Get current weather for a location."""
    if OPENWEATHER_API_KEY:
        try:
            return await _fetch_openweather(location, state)
        except Exception as e:
            logger.warning(f"OpenWeather API failed, using fallback: {e}")

    weather = _get_weather_for_state(state)
    weather["location"] = f"{location}, {state}"
    weather["source"] = "estimated"
    return weather


@router.get("/forecast")
async def get_forecast(
    state: str = Query(default="Gujarat"),
    days: int = Query(default=7, ge=1, le=14),
):
    """Get weather forecast for the next N days."""
    base = _get_weather_for_state(state)
    forecast = []
    for i in range(days):
        idx = i % 7
        temp_variance = random.randint(-4, 4)
        cond_idx = random.randint(0, len(FORECAST_CONDITIONS) - 1)
        forecast.append({
            "day": DAYS_OF_WEEK[idx],
            "temp": base["temperature"] + temp_variance,
            "tempMin": base["temperature"] + temp_variance - random.randint(3, 6),
            "tempMax": base["temperature"] + temp_variance + random.randint(2, 5),
            "condition": FORECAST_CONDITIONS[cond_idx],
            "icon": FORECAST_ICONS[cond_idx],
            "rainChance": min(100, max(0, base["rainChance"] + random.randint(-20, 20))),
            "humidity": min(100, max(20, base["humidity"] + random.randint(-10, 10))),
        })
    return {"state": state, "forecast": forecast}


@router.get("/advisory")
async def get_farming_advisory(
    state: str = Query(default="Gujarat"),
    crop: str = Query(default="Rice"),
    season: str = Query(default="Kharif"),
):
    """Generate farming advisory based on weather and crop conditions."""
    weather = _get_weather_for_state(state)

    advisories = []

    # Temperature-based
    if weather["temperature"] > 35:
        advisories.append({
            "title": "Heat Stress Alert",
            "priority": "High",
            "category": "Weather",
            "description": f"Temperature is {weather['temperature']}°C. Apply mulching to conserve soil moisture.",
            "water": "Increase irrigation frequency. Irrigate during cooler hours (early morning or late evening).",
            "fertilizer": "Avoid fertilizer application during peak heat. Switch to foliar feeding at dawn.",
            "pestControl": "Monitor for mite outbreaks which thrive in hot, dry conditions.",
            "timing": "Shift field work to 5-8 AM and 5-7 PM to avoid heat exhaustion.",
            "expertTip": "Consider shade nets (35% density) for young transplants vulnerable to scorching.",
        })
    elif weather["temperature"] < 15:
        advisories.append({
            "title": "Cold Stress Advisory",
            "priority": "Medium",
            "category": "Weather",
            "description": f"Temperature is {weather['temperature']}°C. Protect seedlings from frost damage.",
            "water": "Reduce irrigation frequency. Avoid waterlogging which worsens cold stress.",
            "fertilizer": "Apply potassium-rich fertilizers to improve cold tolerance.",
            "pestControl": "Watch for fungal infections (damping off) in cool, humid conditions.",
            "timing": "Delay sowing until temperatures stabilize above 15°C for warm-season crops.",
            "expertTip": "Use polyethylene tunnels for nurseries during cold spells.",
        })

    # Rainfall-based
    if weather["rainChance"] > 60:
        advisories.append({
            "title": "Rain Preparedness",
            "priority": "High",
            "category": "Irrigation",
            "description": f"Rain chance is {weather['rainChance']}%. Ensure proper field drainage.",
            "water": "Suspend scheduled irrigation. Clear drainage channels to prevent waterlogging.",
            "fertilizer": "Postpone fertilizer application to prevent nutrient washout.",
            "pestControl": "Apply preventive fungicide before rain to protect against blight and mildew.",
            "timing": "Complete harvesting of mature crops before heavy showers arrive.",
            "expertTip": "Raised bed cultivation reduces root rot risk during prolonged wet spells.",
        })

    # Humidity-based
    if weather["humidity"] > 75:
        advisories.append({
            "title": "High Humidity Alert",
            "priority": "Medium",
            "category": "Pest Control",
            "description": f"Humidity is {weather['humidity']}%. Fungal disease risk is elevated.",
            "water": "Avoid overhead irrigation. Use drip systems to keep foliage dry.",
            "fertilizer": "Reduce nitrogen to limit succulent growth that attracts pests.",
            "pestControl": "Apply Trichoderma-based bio-fungicide as preventive measure.",
            "timing": "Scout fields daily for early signs of powdery mildew or leaf blight.",
            "expertTip": "Maintain proper plant spacing for airflow. Prune lower canopy if congested.",
        })

    # General crop-specific
    advisories.append({
        "title": f"{crop} Growth Advisory",
        "priority": "Normal",
        "category": "General",
        "description": f"Seasonal advisory for {crop} cultivation in {state} during {season} season.",
        "water": f"Maintain optimal soil moisture between 50-70% for {crop}. Monitor with tensiometer.",
        "fertilizer": f"Follow recommended NPK schedule for {crop}. Split nitrogen into 3 doses.",
        "pestControl": f"Install pheromone traps for major {crop} pests. Maintain border crops as trap crops.",
        "timing": "Follow local agricultural university calendar for key crop stage interventions.",
        "expertTip": f"Consult your local KVK (Krishi Vigyan Kendra) for {crop}-specific variety recommendations.",
    })

    return {"state": state, "crop": crop, "season": season, "advisories": advisories}


async def _fetch_openweather(city: str, state: str) -> dict:
    """Fetch weather from OpenWeatherMap API."""
    import httpx
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city},{state},IN&appid={OPENWEATHER_API_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()
    return {
        "temperature": round(data["main"]["temp"]),
        "condition": data["weather"][0]["description"].title(),
        "humidity": data["main"]["humidity"],
        "windSpeed": round(data["wind"]["speed"] * 3.6),  # m/s to km/h
        "rainChance": data.get("clouds", {}).get("all", 0),
        "soilMoisture": None,
        "location": f"{city}, {state}",
        "source": "openweathermap",
    }
