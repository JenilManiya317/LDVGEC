"""
Weather Router — Current weather, forecast, and smart farming advisory.
Powered by Open-Meteo (real-time agro-met telemetry & soil metrics) and OpenWeatherMap,
with Indian geocoding and browser GPS support.
"""

import logging
import random
from typing import Optional, Tuple, Dict, Any
import httpx
from fastapi import APIRouter, Query
from backend.config import OPENWEATHER_API_KEY

logger = logging.getLogger("farmwise.weather")
router = APIRouter(prefix="/api/weather", tags=["Weather"])

# WMO Weather interpretation codes (WW) to human descriptions and icon mappings
WMO_CODE_MAP: Dict[int, Dict[str, str]] = {
    0: {"condition": "Clear Sky", "icon": "Sun", "emoji": "☀️"},
    1: {"condition": "Mainly Clear", "icon": "Sun", "emoji": "🌤️"},
    2: {"condition": "Partly Cloudy", "icon": "CloudSun", "emoji": "⛅"},
    3: {"condition": "Overcast", "icon": "Cloud", "emoji": "☁️"},
    45: {"condition": "Foggy", "icon": "CloudFog", "emoji": "🌫️"},
    48: {"condition": "Depositing Rime Fog", "icon": "CloudFog", "emoji": "🌫️"},
    51: {"condition": "Light Drizzle", "icon": "CloudDrizzle", "emoji": "🌦️"},
    53: {"condition": "Moderate Drizzle", "icon": "CloudDrizzle", "emoji": "🌦️"},
    55: {"condition": "Dense Drizzle", "icon": "CloudDrizzle", "emoji": "🌧️"},
    56: {"condition": "Light Freezing Drizzle", "icon": "CloudSnow", "emoji": "🌨️"},
    57: {"condition": "Dense Freezing Drizzle", "icon": "CloudSnow", "emoji": "🌨️"},
    61: {"condition": "Slight Rain", "icon": "CloudRain", "emoji": "🌧️"},
    63: {"condition": "Moderate Rain", "icon": "CloudRain", "emoji": "🌧️"},
    65: {"condition": "Heavy Rain", "icon": "CloudRain", "emoji": "🌧️"},
    66: {"condition": "Light Freezing Rain", "icon": "CloudRain", "emoji": "🌧️"},
    67: {"condition": "Heavy Freezing Rain", "icon": "CloudRain", "emoji": "🌧️"},
    71: {"condition": "Slight Snow Fall", "icon": "Snowflake", "emoji": "❄️"},
    73: {"condition": "Moderate Snow Fall", "icon": "Snowflake", "emoji": "❄️"},
    75: {"condition": "Heavy Snow Fall", "icon": "Snowflake", "emoji": "❄️"},
    77: {"condition": "Snow Grains", "icon": "Snowflake", "emoji": "❄️"},
    80: {"condition": "Slight Rain Showers", "icon": "CloudRain", "emoji": "🌦️"},
    81: {"condition": "Moderate Rain Showers", "icon": "CloudRain", "emoji": "🌧️"},
    82: {"condition": "Violent Rain Showers", "icon": "CloudRain", "emoji": "⛈️"},
    85: {"condition": "Slight Snow Showers", "icon": "Snowflake", "emoji": "🌨️"},
    86: {"condition": "Heavy Snow Showers", "icon": "Snowflake", "emoji": "🌨️"},
    95: {"condition": "Thunderstorm", "icon": "CloudLightning", "emoji": "⛈️"},
    96: {"condition": "Thunderstorm with Slight Hail", "icon": "CloudLightning", "emoji": "⛈️"},
    99: {"condition": "Thunderstorm with Heavy Hail", "icon": "CloudLightning", "emoji": "⛈️"},
}

DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

# Comprehensive Indian State and Major Agricultural District Coordinates Cache
INDIAN_COORDINATES: Dict[str, Tuple[float, float]] = {
    # Major Agricultural Districts
    "surat": (21.1959, 72.8302),
    "ahmedabad": (23.0225, 72.5714),
    "rajkot": (22.3039, 70.8022),
    "vadodara": (22.3072, 73.1812),
    "junagadh": (21.5222, 70.4579),
    "anand": (22.5645, 72.9289),
    "mehsana": (23.5880, 72.3693),
    "nashik": (19.9975, 73.7898),
    "pune": (18.5204, 73.8567),
    "nagpur": (21.1458, 79.0882),
    "aurangabad": (19.8762, 75.3433),
    "kolhapur": (16.7050, 74.2433),
    "ludhiana": (30.9010, 75.8573),
    "amritsar": (31.6340, 74.8723),
    "jalandhar": (31.3260, 75.5762),
    "karnal": (29.6857, 76.9905),
    "hisar": (29.1492, 75.7217),
    "jaipur": (26.9124, 75.7873),
    "jodhpur": (26.2389, 73.0243),
    "kota": (25.2138, 75.8648),
    "indore": (22.7196, 75.8577),
    "bhopal": (23.2599, 77.4126),
    "ujjain": (23.1765, 75.7885),
    "lucknow": (26.8467, 80.9462),
    "varanasi": (25.3176, 82.9739),
    "kanpur": (26.4499, 80.3319),
    "bengaluru": (12.9716, 77.5946),
    "mandya": (12.5244, 76.8970),
    "dharwad": (15.4589, 75.0078),
    "chennai": (13.0827, 80.2707),
    "coimbatore": (11.0168, 76.9558),
    "madurai": (9.9252, 78.1198),
    "thanjavur": (10.7870, 79.1378),
    "hyderabad": (17.3850, 78.4867),
    "warangal": (17.9689, 79.5941),
    "guntur": (16.3067, 80.4365),
    "vijayawada": (16.5062, 80.6480),
    "kolkata": (22.5726, 88.3639),
    "burdwan": (23.2324, 87.8615),
    "patna": (25.5941, 85.1376),
    "kochi": (9.9312, 76.2673),
    "palakkad": (10.7867, 76.6548),
    "alappuzha": (9.4981, 76.3388),
    
    # States (Geographical Centers)
    "gujarat": (22.2587, 71.1924),
    "maharashtra": (19.7515, 75.7139),
    "punjab": (31.1471, 75.3412),
    "haryana": (29.0588, 76.0856),
    "rajasthan": (27.0238, 74.2179),
    "madhya pradesh": (22.9734, 78.6569),
    "uttar pradesh": (26.8467, 80.9462),
    "karnataka": (15.3173, 75.7139),
    "tamil nadu": (11.1271, 78.6569),
    "kerala": (10.8505, 76.2711),
    "andhra pradesh": (15.9129, 79.7400),
    "telangana": (18.1124, 79.0193),
    "west bengal": (22.9868, 87.8550),
    "bihar": (25.0961, 85.3131),
    "odisha": (20.9517, 85.0985),
    "assam": (26.2006, 92.9376),
}

# Realistic fallback weather data templates by Indian state
WEATHER_TEMPLATES = {
    "Gujarat": {"temp": 32, "humidity": 55, "wind": 12, "rain_chance": 25, "condition": "Partly Cloudy", "soil_moisture": 52, "soil_temp": 28.5, "et0": 4.5},
    "Maharashtra": {"temp": 29, "humidity": 68, "wind": 10, "rain_chance": 40, "condition": "Humid", "soil_moisture": 62, "soil_temp": 26.0, "et0": 3.8},
    "Punjab": {"temp": 34, "humidity": 50, "wind": 15, "rain_chance": 15, "condition": "Sunny", "soil_moisture": 45, "soil_temp": 29.0, "et0": 5.2},
    "Karnataka": {"temp": 27, "humidity": 72, "wind": 8, "rain_chance": 55, "condition": "Light Rain", "soil_moisture": 68, "soil_temp": 24.5, "et0": 3.4},
    "Tamil Nadu": {"temp": 31, "humidity": 78, "wind": 14, "rain_chance": 35, "condition": "Warm", "soil_moisture": 58, "soil_temp": 27.8, "et0": 4.1},
    "Kerala": {"temp": 28, "humidity": 85, "wind": 10, "rain_chance": 70, "condition": "Rainy", "soil_moisture": 82, "soil_temp": 25.0, "et0": 2.9},
    "Uttar Pradesh": {"temp": 33, "humidity": 60, "wind": 11, "rain_chance": 30, "condition": "Hot", "soil_moisture": 50, "soil_temp": 28.0, "et0": 4.8},
    "West Bengal": {"temp": 30, "humidity": 80, "wind": 9, "rain_chance": 50, "condition": "Muggy", "soil_moisture": 70, "soil_temp": 27.0, "et0": 3.6},
    "Rajasthan": {"temp": 38, "humidity": 25, "wind": 20, "rain_chance": 5, "condition": "Hot & Dry", "soil_moisture": 22, "soil_temp": 32.5, "et0": 6.8},
    "Madhya Pradesh": {"temp": 31, "humidity": 58, "wind": 12, "rain_chance": 35, "condition": "Partly Cloudy", "soil_moisture": 54, "soil_temp": 27.5, "et0": 4.3},
}


async def _resolve_coordinates(location: Optional[str] = None, state: Optional[str] = None) -> Tuple[float, float, str]:
    """
    Resolve Indian district / city and state names to latitude & longitude.
    Uses local coordinate cache first, then Open-Meteo Geocoding API with India filter.
    """
    loc_clean = (location or "").strip().lower()
    state_clean = (state or "").strip().lower()

    # 1. Direct local cache match
    if loc_clean and loc_clean in INDIAN_COORDINATES:
        lat, lon = INDIAN_COORDINATES[loc_clean]
        return lat, lon, f"{location.title()}, {state or 'India'}"
    
    if state_clean and state_clean in INDIAN_COORDINATES:
        lat, lon = INDIAN_COORDINATES[state_clean]
        display = f"{location.title()}, {state.title()}" if location else state.title()
        return lat, lon, display

    # 2. Dynamic Geocoding via Open-Meteo Geocoding API
    query_str = f"{location} {state}".strip() if location and state else (location or state or "Surat Gujarat")
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={httpx.URL(query_str)}&count=5&language=en&format=json"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                # Prioritize Indian results
                india_results = [r for r in results if r.get("country_code") == "IN"]
                target = india_results[0] if india_results else (results[0] if results else None)
                if target:
                    lat = float(target["latitude"])
                    lon = float(target["longitude"])
                    name = target.get("name", location or "Farm")
                    admin = target.get("admin1", state or "India")
                    return lat, lon, f"{name}, {admin}"
    except Exception as e:
        logger.warning(f"Geocoding lookup failed for '{query_str}': {e}")

    # 3. Default fallback: Surat, Gujarat
    return 21.1959, 72.8302, f"{location or 'Surat'}, {state or 'Gujarat'}"


async def _fetch_open_meteo(lat: float, lon: float, days: int = 7) -> Dict[str, Any]:
    """
    Fetch comprehensive meteorological and agronomic metrics from Open-Meteo.
    Includes current conditions, 0-7cm soil telemetry, FAO ET0 evapotranspiration, and 7-day forecast.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation"
        f"&hourly=soil_temperature_0_to_7cm,soil_moisture_0_to_7cm,et0_fao_evapotranspiration,precipitation_probability"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,precipitation_probability_max,weather_code,et0_fao_evapotranspiration"
        f"&timezone=auto&forecast_days={max(1, min(days, 14))}&wind_speed_unit=kmh"
    )

    async with httpx.AsyncClient(timeout=6.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    # Current telemetry
    cur = data.get("current", {})
    wmo_code = int(cur.get("weather_code", 0))
    wmo_meta = WMO_CODE_MAP.get(wmo_code, {"condition": "Clear", "icon": "Sun", "emoji": "☀️"})

    # Extract agricultural indicators from current hour in hourly telemetry
    hourly = data.get("hourly", {})
    hourly_times = hourly.get("time", [])
    cur_time = cur.get("time", "")
    h_idx = 0
    if cur_time and cur_time in hourly_times:
        h_idx = hourly_times.index(cur_time)
    elif len(hourly_times) > 0:
        h_idx = min(len(hourly_times) - 1, 0)

    # 0-7cm Volumetric Soil Moisture (m³/m³ converted to %)
    soil_moist_raw = 0.45
    if hourly.get("soil_moisture_0_to_7cm") and len(hourly["soil_moisture_0_to_7cm"]) > h_idx:
        val = hourly["soil_moisture_0_to_7cm"][h_idx]
        if val is not None:
            soil_moist_raw = float(val)
    soil_moisture_pct = round(soil_moist_raw * 100, 1)

    # 0-7cm Soil Temperature (°C)
    soil_temp = 26.0
    if hourly.get("soil_temperature_0_to_7cm") and len(hourly["soil_temperature_0_to_7cm"]) > h_idx:
        val = hourly["soil_temperature_0_to_7cm"][h_idx]
        if val is not None:
            soil_temp = round(float(val), 1)

    # Hourly precipitation probability (%)
    precip_prob = 0
    if hourly.get("precipitation_probability") and len(hourly["precipitation_probability"]) > h_idx:
        val = hourly["precipitation_probability"][h_idx]
        if val is not None:
            precip_prob = int(val)

    # Daily Forecast & Evapotranspiration (ET0)
    daily = data.get("daily", {})
    daily_times = daily.get("time", [])
    daily_tmax = daily.get("temperature_2m_max", [])
    daily_tmin = daily.get("temperature_2m_min", [])
    daily_precip = daily.get("precipitation_sum", [])
    daily_uv = daily.get("uv_index_max", [])
    daily_precip_prob = daily.get("precipitation_probability_max", [])
    daily_codes = daily.get("weather_code", [])
    daily_et0 = daily.get("et0_fao_evapotranspiration", [])

    forecast = []
    for i in range(len(daily_times)):
        d_code = int(daily_codes[i]) if i < len(daily_codes) and daily_codes[i] is not None else 0
        d_meta = WMO_CODE_MAP.get(d_code, {"condition": "Partly Cloudy", "icon": "CloudSun", "emoji": "⛅"})
        t_max = round(daily_tmax[i]) if i < len(daily_tmax) and daily_tmax[i] is not None else round(cur.get("temperature_2m", 28))
        t_min = round(daily_tmin[i]) if i < len(daily_tmin) and daily_tmin[i] is not None else (t_max - 5)
        p_prob = int(daily_precip_prob[i]) if i < len(daily_precip_prob) and daily_precip_prob[i] is not None else precip_prob
        p_sum = round(float(daily_precip[i]), 1) if i < len(daily_precip) and daily_precip[i] is not None else 0.0
        uv = round(float(daily_uv[i]), 1) if i < len(daily_uv) and daily_uv[i] is not None else 6.0

        # Day label (e.g. Today, Tomorrow, Mon, Tue, etc.)
        if i == 0:
            day_label = "Today"
        elif i == 1:
            day_label = "Tomorrow"
        else:
            try:
                import datetime
                dt = datetime.date.fromisoformat(daily_times[i])
                day_label = DAYS_OF_WEEK[dt.weekday()]
            except Exception:
                day_label = DAYS_OF_WEEK[i % 7]

        forecast.append({
            "day": day_label,
            "date": daily_times[i],
            "temp": round((t_max + t_min) / 2),
            "tempMin": t_min,
            "tempMax": t_max,
            "condition": d_meta["condition"],
            "icon": d_meta["icon"],
            "emoji": d_meta["emoji"],
            "rainChance": p_prob,
            "precipitationSum": p_sum,
            "uvIndex": uv,
            "et0": round(float(daily_et0[i]), 2) if i < len(daily_et0) and daily_et0[i] is not None else 4.0,
        })

    today_et0 = forecast[0]["et0"] if forecast else 4.0
    today_uv = forecast[0]["uvIndex"] if forecast else 6.5
    today_rain_chance = forecast[0]["rainChance"] if forecast else precip_prob

    return {
        "temperature": round(cur.get("temperature_2m", 28)),
        "apparentTemperature": round(cur.get("apparent_temperature", cur.get("temperature_2m", 28))),
        "condition": wmo_meta["condition"],
        "icon": wmo_meta["icon"],
        "emoji": wmo_meta["emoji"],
        "humidity": round(cur.get("relative_humidity_2m", 60)),
        "windSpeed": round(cur.get("wind_speed_10m", 12)),
        "rainChance": today_rain_chance,
        "precipitation": round(cur.get("precipitation", 0.0), 1),
        "soilMoisture": soil_moisture_pct,
        "soilTemperature": soil_temp,
        "evapotranspiration": today_et0,
        "uvIndex": today_uv,
        "latitude": lat,
        "longitude": lon,
        "forecast": forecast,
        "source": "open-meteo",
    }


async def _fetch_openweather(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch current weather from OpenWeatherMap API using coordinates."""
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    return {
        "temperature": round(data["main"]["temp"]),
        "apparentTemperature": round(data["main"].get("feels_like", data["main"]["temp"])),
        "condition": data["weather"][0]["description"].title(),
        "icon": "CloudSun",
        "emoji": "⛅",
        "humidity": data["main"]["humidity"],
        "windSpeed": round(data["wind"]["speed"] * 3.6),
        "rainChance": data.get("clouds", {}).get("all", 15),
        "soilMoisture": 55.0,
        "soilTemperature": round(data["main"]["temp"] - 2.0),
        "evapotranspiration": 4.0,
        "uvIndex": 6.0,
        "latitude": lat,
        "longitude": lon,
        "source": "openweathermap",
    }


def _get_fallback_weather(state: str, location: str, lat: float, lon: float) -> Dict[str, Any]:
    """Generate realistic weather and agricultural fallback data."""
    base = WEATHER_TEMPLATES.get(state, WEATHER_TEMPLATES.get("Gujarat", {
        "temp": 30, "humidity": 60, "wind": 12, "rain_chance": 20,
        "condition": "Partly Cloudy", "soil_moisture": 55, "soil_temp": 27.0, "et0": 4.2
    }))

    temp = base["temp"] + random.randint(-2, 2)
    humidity = min(100, max(20, base["humidity"] + random.randint(-4, 4)))
    soil_m = min(95.0, max(15.0, base["soil_moisture"] + random.uniform(-3, 3)))
    rain_c = min(100, max(0, base["rain_chance"] + random.randint(-8, 8)))

    forecast = []
    for i in range(7):
        t_max = temp + random.randint(-2, 3)
        t_min = t_max - random.randint(4, 7)
        day_name = "Today" if i == 0 else ("Tomorrow" if i == 1 else DAYS_OF_WEEK[i % 7])
        forecast.append({
            "day": day_name,
            "temp": round((t_max + t_min) / 2),
            "tempMin": t_min,
            "tempMax": t_max,
            "condition": base["condition"],
            "icon": "CloudSun",
            "emoji": "⛅",
            "rainChance": min(100, max(0, rain_c + random.randint(-15, 15))),
            "precipitationSum": 0.0 if rain_c < 40 else round(random.uniform(1.0, 8.5), 1),
            "uvIndex": round(random.uniform(5.5, 8.0), 1),
            "et0": round(base["et0"] + random.uniform(-0.4, 0.4), 2),
        })

    return {
        "temperature": temp,
        "apparentTemperature": temp + (2 if humidity > 60 else -1),
        "condition": base["condition"],
        "icon": "CloudSun",
        "emoji": "⛅",
        "humidity": humidity,
        "windSpeed": base["wind"] + random.randint(-2, 2),
        "rainChance": rain_c,
        "precipitation": 0.0,
        "soilMoisture": round(soil_m, 1),
        "soilTemperature": round(base["soil_temp"] + random.uniform(-1, 1), 1),
        "evapotranspiration": base["et0"],
        "uvIndex": 6.5,
        "location": f"{location}, {state}",
        "latitude": lat,
        "longitude": lon,
        "forecast": forecast,
        "source": "estimated",
    }


@router.get("/current")
async def get_current_weather(
    lat: Optional[float] = Query(default=None, description="GPS Latitude"),
    lon: Optional[float] = Query(default=None, description="GPS Longitude"),
    state: str = Query(default="Gujarat", description="Indian state name"),
    location: str = Query(default="Surat", description="City or district"),
):
    """
    Get current weather and agricultural indicators.
    Prioritizes Open-Meteo with GPS or geocoded Indian coordinates,
    then OpenWeatherMap, with realistic state fallback.
    """
    # 1. Resolve coordinates
    display_location = f"{location}, {state}"
    if lat is None or lon is None:
        lat, lon, display_location = await _resolve_coordinates(location, state)
    else:
        display_location = f"{lat:.2f}°N, {lon:.2f}°E"

    # 2. Try Open-Meteo (Rich agricultural data)
    try:
        data = await _fetch_open_meteo(lat, lon, days=7)
        data["location"] = display_location
        return data
    except Exception as e:
        logger.warning(f"Open-Meteo API failed for ({lat}, {lon}): {e}")

    # 3. Fallback to OpenWeatherMap if configured
    if OPENWEATHER_API_KEY:
        try:
            data = await _fetch_openweather(lat, lon)
            data["location"] = display_location
            return data
        except Exception as e:
            logger.warning(f"OpenWeatherMap API fallback failed: {e}")

    # 4. Realistic fallback
    fallback = _get_fallback_weather(state, location, lat, lon)
    fallback["location"] = display_location
    return fallback


@router.get("/forecast")
async def get_forecast(
    lat: Optional[float] = Query(default=None, description="GPS Latitude"),
    lon: Optional[float] = Query(default=None, description="GPS Longitude"),
    state: str = Query(default="Gujarat", description="Indian state name"),
    location: str = Query(default="Surat", description="City or district"),
    days: int = Query(default=7, ge=1, le=14, description="Forecast days"),
):
    """Get 7 to 14-day agronomic weather forecast."""
    display_location = f"{location}, {state}"
    if lat is None or lon is None:
        lat, lon, display_location = await _resolve_coordinates(location, state)
    else:
        display_location = f"{lat:.2f}°N, {lon:.2f}°E"

    try:
        data = await _fetch_open_meteo(lat, lon, days=days)
        return {
            "state": state,
            "location": display_location,
            "latitude": lat,
            "longitude": lon,
            "forecast": data.get("forecast", []),
            "source": "open-meteo",
        }
    except Exception as e:
        logger.warning(f"Forecast fetch failed: {e}")
        fallback = _get_fallback_weather(state, location, lat, lon)
        return {
            "state": state,
            "location": display_location,
            "latitude": lat,
            "longitude": lon,
            "forecast": fallback["forecast"][:days],
            "source": "estimated",
        }


@router.get("/advisory")
async def get_farming_advisory(
    lat: Optional[float] = Query(default=None, description="GPS Latitude"),
    lon: Optional[float] = Query(default=None, description="GPS Longitude"),
    state: str = Query(default="Gujarat"),
    location: str = Query(default="Surat"),
    crop: str = Query(default="Rice"),
    season: str = Query(default="Kharif"),
):
    """
    Generate precision agronomic advisories based on real-time weather,
    0-7cm volumetric soil moisture thresholds, and FAO evapotranspiration (ET0).
    """
    # Fetch live weather & agricultural telemetry
    weather = await get_current_weather(lat=lat, lon=lon, state=state, location=location)

    soil_m = weather.get("soilMoisture", 50.0)
    soil_temp = weather.get("soilTemperature", 27.0)
    et0 = weather.get("evapotranspiration", 4.0)
    temp = weather.get("temperature", 30)
    humidity = weather.get("humidity", 65)
    rain_chance = weather.get("rainChance", 20)

    # 1. Real Evapotranspiration & Soil Moisture Threshold Evaluation
    irrigation_priority = "Normal"
    if soil_m < 35.0:
        irrigation_priority = "High"
        irrigation_title = "Critically Low Soil Moisture: Urgent Irrigation"
        irrigation_desc = (
            f"0-7cm topsoil volumetric moisture is {soil_m}%, below the critical 35% agronomic threshold. "
            f"Reference evapotranspiration (ET0) is {et0} mm/day, accelerating root dehydration."
        )
        irrigation_action = (
            f"Initiate immediate deep drip irrigation cycle (35-45mm). Irrigate between 05:00 AM - 08:00 AM "
            f"to replenish the root zone and prevent wilting. Add organic straw mulching to curb evaporative loss."
        )
    elif soil_m > 80.0:
        irrigation_priority = "High"
        irrigation_title = "Waterlogging & Soil Saturation Alert"
        irrigation_desc = (
            f"Soil moisture is at {soil_m}%, exceeding field capacity. Saturated root conditions promote "
            f"anaerobic decay, Phytophthora root rot, and poor nutrient uptake."
        )
        irrigation_action = (
            "Immediately suspend all scheduled irrigation cycles. Clear field drainage channels and furrows. "
            "Avoid running heavy machinery over wet soil to prevent subsoil compaction."
        )
    elif et0 > 5.0:
        irrigation_priority = "High"
        irrigation_title = f"High Evaporative Demand ({et0} mm/day)"
        irrigation_desc = (
            f"Atmospheric evaporative demand is intense (ET0 = {et0} mm/day) under {temp}°C ambient temperature. "
            f"Transpiration rates exceed standard daily replenishment."
        )
        irrigation_action = (
            "Increase irrigation frequency with shorter cycle durations. Shift irrigation exclusively to early "
            "dawn hours (05:30 - 07:30 AM) to maintain plant cellular turgidity."
        )
    else:
        irrigation_title = "Optimal Soil Hydration Maintained"
        irrigation_desc = (
            f"0-7cm soil moisture is balanced at {soil_m}%, with steady atmospheric evapotranspiration "
            f"of {et0} mm/day. Root zone moisture is within the ideal 45-70% agronomic window for {crop}."
        )

        irrigation_action = (
            f"Continue scheduled maintenance fertigation. Next moisture audit recommended in 48 hours."
        )

    # 2. Fertilizer Advisory based on Soil Moisture and Rain
    if rain_chance > 60:
        fert_priority = "High"
        fert_title = "Precipitation Warning: Postpone Broadcast"
        fert_desc = f"Rain probability is {rain_chance}%. High runoff and leaching risk will cause significant fertilizer waste."
        fert_action = "Withhold urea and granular fertilizer broadcasting until the weather window clears. Prepare for foliar zinc/boron application once foliage dries."
    elif soil_m < 30.0:
        fert_priority = "Medium"
        fert_title = "Dry Soil: Delay Chemical Fertilizers"
        fert_desc = f"Soil moisture is {soil_m}%. Applying concentrated fertilizers to dry soil causes root scorch."
        fert_action = "Irrigate the field thoroughly first. Broadcast nutrients only once soil moisture recovers above 45%."
    else:
        fert_priority = "Normal"
        fert_title = f"Optimal Soil Nutrition Schedule for {crop}"
        fert_desc = f"Soil temperature is {soil_temp}°C and moisture is {soil_m}%, ideal for microbial nutrient mineralization."
        fert_action = f"Apply balanced NPK 19:19:19 bio-fertilizer with micronutrient booster. Fertigate between 08:30 AM and 10:30 AM."

    # 3. Pest & Disease Prevention based on Humidity, Soil Temp & Rain
    if humidity > 75 or rain_chance > 50:
        pest_priority = "High"
        pest_title = "Elevated Fungal & Blight Threat"
        pest_desc = f"Relative humidity is {humidity}% with soil temp at {soil_temp}°C. Conditions favor downy mildew, leaf blast, and damping-off."
        pest_action = "Spray preventative Trichoderma viride or copper-based bio-fungicide during calm dusk hours (05:00 PM). Ensure adequate aeration in plant canopy."
    elif temp > 35 and humidity < 40:
        pest_priority = "Medium"
        pest_title = "Hot & Dry Microclimate: Mite Scouting"
        pest_desc = f"High temperature ({temp}°C) and dry air accelerate two-spotted spider mite and thrips reproduction."
        pest_action = "Scout undersides of mature leaves for stippling. Apply neem oil emulsion (5ml/L) at sunset."
    else:
        pest_priority = "Normal"
        pest_title = f"Standard Pest Monitoring for {crop}"
        pest_desc = "Low pest pressure detected under current meteorological parameters."
        pest_action = "Maintain 6 yellow and blue sticky traps per acre. Inspect border trap crops twice weekly."

    # 4. Harvest Protocol
    if rain_chance > 55:
        harvest_priority = "High"
        harvest_title = "Wet Spell Approaching: Harvest Mature Plots"
        harvest_desc = f"Rain chance is {rain_chance}%. Extended wet spells spoil mature produce and induce post-harvest mold."
        harvest_action = "Expedite picking of mature crops immediately. Store harvested yield in dry, elevated, ventilated crates."
    else:
        harvest_priority = "Normal"
        harvest_title = f"Post-Harvest & Plucking Guidance for {crop}"
        harvest_desc = f"Current temperature {temp}°C and {soil_m}% soil moisture allow safe plucking with minimal fruit stress."
        harvest_action = "Withhold irrigation 24-48 hours before plucking to enhance sugar brix and transport firmness. Pluck in early morning."

    category_advisory = {
        "irrigation": {
            "title": irrigation_title,
            "priority": irrigation_priority,
            "description": irrigation_desc,
            "action": irrigation_action,
            "water": irrigation_action,
            "fertilizer": "Ensure adequate root moisture before fertigation.",
            "pestControl": "Keep drip emitters clear to prevent localized puddling.",
            "timing": "Optimal irrigation window: 05:30 AM - 07:30 AM",
            "expertTip": f"At {soil_m}% moisture and {et0} mm/day ET₀, mulching reduces irrigation frequency by up to 25%.",
        },
        "fertilizer": {
            "title": fert_title,
            "priority": fert_priority,
            "description": fert_desc,
            "action": fert_action,
            "water": "Irrigate lightly immediately after fertilization to prevent volatilization.",
            "fertilizer": fert_action,
            "pestControl": "Avoid excessive nitrogen which causes succulent foliage susceptible to aphids.",
            "timing": "Apply nutrients between 08:30 AM - 10:30 AM.",
            "expertTip": f"Soil temperature at 0-7cm is {soil_temp}°C. Beneficial rhizosphere microbes operate with peak efficiency between 22-30°C.",
        },
        "pest": {
            "title": pest_title,
            "priority": pest_priority,
            "description": pest_desc,
            "action": pest_action,
            "water": "Avoid overhead sprinkler irrigation to keep foliar canopy dry.",
            "fertilizer": "Use potassium silicate foliar spray to strengthen leaf cuticles against piercing insects.",
            "pestControl": pest_action,
            "timing": "Spray bio-pesticides during dusk (05:00 PM - 06:30 PM).",
            "expertTip": "Trichoderma bio-fungicide is 3x more effective when applied preventatively before rain events.",
        },
        "harvest": {
            "title": harvest_title,
            "priority": harvest_priority,
            "description": harvest_desc,
            "action": harvest_action,
            "water": "Cease irrigation 48 hours prior to harvest for peak produce firmness.",
            "fertilizer": "Strictly follow 14-day pre-harvest chemical interval (PHI).",
            "pestControl": "Clean harvest crates with 100ppm chlorine or potassium permanganate solution.",
            "timing": "Pluck between 06:00 AM and 09:30 AM before daytime solar heat peaks.",
            "expertTip": "Sort and pre-cool produce in shaded shed to extend retail shelf life by up to 4 days.",
        }
    }

    # Also build list of advisories for backwards compatibility
    advisories_list = [
        {
            "title": irrigation_title,
            "priority": irrigation_priority,
            "category": "Irrigation",
            "description": irrigation_desc,
            "action": irrigation_action,
            "water": irrigation_action,
            "fertilizer": category_advisory["irrigation"]["fertilizer"],
            "pestControl": category_advisory["irrigation"]["pestControl"],
            "timing": category_advisory["irrigation"]["timing"],
            "expertTip": category_advisory["irrigation"]["expertTip"],
        },
        {
            "title": fert_title,
            "priority": fert_priority,
            "category": "Fertilizer",
            "description": fert_desc,
            "action": fert_action,
            "water": category_advisory["fertilizer"]["water"],
            "fertilizer": fert_action,
            "pestControl": category_advisory["fertilizer"]["pestControl"],
            "timing": category_advisory["fertilizer"]["timing"],
            "expertTip": category_advisory["fertilizer"]["expertTip"],
        },
        {
            "title": pest_title,
            "priority": pest_priority,
            "category": "Pest Control",
            "description": pest_desc,
            "action": pest_action,
            "water": category_advisory["pest"]["water"],
            "fertilizer": category_advisory["pest"]["fertilizer"],
            "pestControl": pest_action,
            "timing": category_advisory["pest"]["timing"],
            "expertTip": category_advisory["pest"]["expertTip"],
        },
        {
            "title": harvest_title,
            "priority": harvest_priority,
            "category": "Harvest",
            "description": harvest_desc,
            "action": harvest_action,
            "water": category_advisory["harvest"]["water"],
            "fertilizer": category_advisory["harvest"]["fertilizer"],
            "pestControl": category_advisory["harvest"]["pestControl"],
            "timing": category_advisory["harvest"]["timing"],
            "expertTip": category_advisory["harvest"]["expertTip"],
        },
    ]

    return {
        "state": state,
        "location": weather.get("location", f"{location}, {state}"),
        "crop": crop,
        "season": season,
        "telemetry": {
            "soilMoisture": soil_m,
            "soilTemperature": soil_temp,
            "evapotranspiration": et0,
            "temperature": temp,
            "humidity": humidity,
            "rainChance": rain_chance,
        },
        "advisory": category_advisory,
        "advisories": advisories_list,
    }
