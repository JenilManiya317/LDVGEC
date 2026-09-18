import {
  CropData,
  MarketPriceItem,
  WeatherData,
  FarmingAdvisoryCategory,
  TaskInstruction,
  TimetableScheduleDay,
  ProductItem,
  OrderItem,
  UserProfile,
  CropHealthAnalysis
} from './types';

// Demo Profiles
export const DEMO_FARMER: UserProfile = {
  id: 'farmer_01',
  name: 'Rudra Patel',
  email: 'rudra.farmer@agrisetu.in',
  role: 'farmer',
  phone: '+91 98251 44321',
  location: 'Surat, Gujarat',
  avatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
  farmName: 'Patel Organic Farms',
  totalArea: '12.5 Acres',
  rating: 4.9,
  reviewsCount: 142
};

export const DEMO_CUSTOMER: UserProfile = {
  id: 'customer_01',
  name: 'Aarav Sharma',
  email: 'aarav.customer@gmail.com',
  role: 'customer',
  phone: '+91 97234 88120',
  location: 'Ahmedabad, Gujarat',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
};

// Agricultural Dataset Supported Crops
export const MOCK_CROPS_DATASET: CropData[] = [
  {
    id: 'crop_tomato_01',
    name: 'Tomato',
    variety: 'Abhinav Hybrid (F1)',
    season: 'Kharif',
    state: 'Gujarat',
    area: 3.5,
    production: 85,
    rainfall: 620,
    fertilizer: 'NPK 19:19:19 + Vermicompost (150 kg/ha)',
    pesticide: 'Neem Oil Extract 3000 ppm (Organic Bio-control)',
    yield: 24.2,
    temperature: 27,
    humidity: 64,
    soilType: 'Loamy Alluvial Soil',
    soilPh: 6.8,
    nitrogen: 145,
    phosphorus: 62,
    potassium: 180,
    soilMoisture: 72,
    irrigation: 'Drip Micro-irrigation',
    sowingMonth: 'June',
    harvestMonth: 'November',
    growingDays: 110,
    soilFertility: 'High',
    pestRisk: 'Low',
    diseaseRisk: 'Low',
    waterAvailability: 'Optimal',
    weatherStress: 'Low',
    cropHealthPercentage: 94,
    healthStatus: 'Healthy',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_potato_02',
    name: 'Potato',
    variety: 'Kufri Jyoti (Certified Seed)',
    season: 'Rabi',
    state: 'Gujarat',
    area: 2.8,
    production: 68,
    rainfall: 450,
    fertilizer: 'DAP 18:46:0 + MOP Potash (200 kg/ha)',
    pesticide: 'Trichoderma viride + Bacillus subtilis',
    yield: 24.5,
    temperature: 21,
    humidity: 58,
    soilType: 'Sandy Loam with Organic Matter',
    soilPh: 6.2,
    nitrogen: 160,
    phosphorus: 75,
    potassium: 195,
    soilMoisture: 68,
    irrigation: 'Furrow Controlled Irrigation',
    sowingMonth: 'October',
    harvestMonth: 'February',
    growingDays: 95,
    soilFertility: 'High',
    pestRisk: 'Medium',
    diseaseRisk: 'Low',
    waterAvailability: 'Optimal',
    weatherStress: 'Low',
    cropHealthPercentage: 91,
    healthStatus: 'Healthy',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_onion_03',
    name: 'Red Onion',
    variety: 'Nashik Dark Red',
    season: 'Rabi',
    state: 'Gujarat',
    area: 2.2,
    production: 48,
    rainfall: 520,
    fertilizer: 'Ammonium Sulphate + Single Super Phosphate',
    pesticide: 'Pseudomonas fluorescens 1%',
    yield: 21.8,
    temperature: 24,
    humidity: 61,
    soilType: 'Deep Black Cotton Soil',
    soilPh: 7.1,
    nitrogen: 120,
    phosphorus: 50,
    potassium: 110,
    soilMoisture: 65,
    irrigation: 'Sprinkler System',
    sowingMonth: 'November',
    harvestMonth: 'April',
    growingDays: 130,
    soilFertility: 'Medium',
    pestRisk: 'Low',
    diseaseRisk: 'Low',
    waterAvailability: 'Adequate',
    weatherStress: 'Low',
    cropHealthPercentage: 88,
    healthStatus: 'Healthy',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_wheat_04',
    name: 'Golden Wheat',
    variety: 'Sharbati MP High Protein',
    season: 'Rabi',
    state: 'Gujarat',
    area: 2.5,
    production: 52,
    rainfall: 380,
    fertilizer: 'Urea (split dose) + Zinc Sulphate 21%',
    pesticide: 'Organic Beauveria bassiana',
    yield: 20.8,
    temperature: 19,
    humidity: 52,
    soilType: 'Clay Loam with High Water Retention',
    soilPh: 7.4,
    nitrogen: 135,
    phosphorus: 60,
    potassium: 90,
    soilMoisture: 60,
    irrigation: 'Flood basin at Crown Root Stage',
    sowingMonth: 'November',
    harvestMonth: 'March',
    growingDays: 120,
    soilFertility: 'High',
    pestRisk: 'Low',
    diseaseRisk: 'Low',
    waterAvailability: 'Adequate',
    weatherStress: 'Low',
    cropHealthPercentage: 95,
    healthStatus: 'Healthy',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_bellpepper_05',
    name: 'Green Capsicum',
    variety: 'Indra F1 Hybrid',
    season: 'Whole Year',
    state: 'Gujarat',
    area: 1.5,
    production: 32,
    rainfall: 590,
    fertilizer: 'Calcium Nitrate + Water Soluble NPK',
    pesticide: 'Yellow Sticky Traps + Bio-neem',
    yield: 21.3,
    temperature: 26,
    humidity: 68,
    soilType: 'Rich Loam with Farmyard Manure',
    soilPh: 6.5,
    nitrogen: 150,
    phosphorus: 70,
    potassium: 160,
    soilMoisture: 75,
    irrigation: 'Automated Polyhouse Drip',
    sowingMonth: 'August',
    harvestMonth: 'January',
    growingDays: 140,
    soilFertility: 'High',
    pestRisk: 'Low',
    diseaseRisk: 'Low',
    waterAvailability: 'Optimal',
    weatherStress: 'Low',
    cropHealthPercentage: 92,
    healthStatus: 'Healthy',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'
  }
];

// Market Price Dataset with recent trends
export const MOCK_MARKET_PRICES: MarketPriceItem[] = [
  {
    id: 'mp_01',
    cropName: 'Tomato',
    currentPrice: 2450,
    previousPrice: 2260,
    trendPercentage: 8.4,
    isPositive: true,
    marketLocation: 'APMC Market Yard, Surat',
    lastUpdated: 'Today, 08:30 AM',
    priceHistory: [
      { day: 'Mon', price: 2180 },
      { day: 'Tue', price: 2230 },
      { day: 'Wed', price: 2260 },
      { day: 'Thu', price: 2340 },
      { day: 'Fri', price: 2390 },
      { day: 'Sat', price: 2420 },
      { day: 'Today', price: 2450 }
    ]
  },
  {
    id: 'mp_02',
    cropName: 'Potato',
    currentPrice: 1850,
    previousPrice: 1758,
    trendPercentage: 5.2,
    isPositive: true,
    marketLocation: 'APMC Mandi, Ahmedabad',
    lastUpdated: 'Today, 08:15 AM',
    priceHistory: [
      { day: 'Mon', price: 1720 },
      { day: 'Tue', price: 1740 },
      { day: 'Wed', price: 1758 },
      { day: 'Thu', price: 1790 },
      { day: 'Fri', price: 1810 },
      { day: 'Sat', price: 1835 },
      { day: 'Today', price: 1850 }
    ]
  },
  {
    id: 'mp_03',
    cropName: 'Onion',
    currentPrice: 1950,
    previousPrice: 1873,
    trendPercentage: 4.1,
    isPositive: true,
    marketLocation: 'APMC Market, Lasalgaon',
    lastUpdated: 'Today, 07:50 AM',
    priceHistory: [
      { day: 'Mon', price: 1840 },
      { day: 'Tue', price: 1855 },
      { day: 'Wed', price: 1873 },
      { day: 'Thu', price: 1890 },
      { day: 'Fri', price: 1920 },
      { day: 'Sat', price: 1935 },
      { day: 'Today', price: 1950 }
    ]
  },
  {
    id: 'mp_04',
    cropName: 'Wheat',
    currentPrice: 2220,
    previousPrice: 2250,
    trendPercentage: -1.3,
    isPositive: false,
    marketLocation: 'Rajkot Grain Mandi',
    lastUpdated: 'Today, 08:45 AM',
    priceHistory: [
      { day: 'Mon', price: 2290 },
      { day: 'Tue', price: 2280 },
      { day: 'Wed', price: 2250 },
      { day: 'Thu', price: 2240 },
      { day: 'Fri', price: 2235 },
      { day: 'Sat', price: 2230 },
      { day: 'Today', price: 2220 }
    ]
  },
  {
    id: 'mp_05',
    cropName: 'Basmati Rice',
    currentPrice: 3850,
    previousPrice: 3720,
    trendPercentage: 3.5,
    isPositive: true,
    marketLocation: 'Karnal Grain Exchange',
    lastUpdated: 'Today, 09:00 AM',
    priceHistory: [
      { day: 'Mon', price: 3680 },
      { day: 'Tue', price: 3700 },
      { day: 'Wed', price: 3720 },
      { day: 'Thu', price: 3760 },
      { day: 'Fri', price: 3800 },
      { day: 'Sat', price: 3820 },
      { day: 'Today', price: 3850 }
    ]
  },
  {
    id: 'mp_06',
    cropName: 'Green Capsicum',
    currentPrice: 3100,
    previousPrice: 2950,
    trendPercentage: 5.1,
    isPositive: true,
    marketLocation: 'Vashi Wholesale Market',
    lastUpdated: 'Today, 08:20 AM',
    priceHistory: [
      { day: 'Mon', price: 2900 },
      { day: 'Tue', price: 2920 },
      { day: 'Wed', price: 2950 },
      { day: 'Thu', price: 3010 },
      { day: 'Fri', price: 3050 },
      { day: 'Sat', price: 3080 },
      { day: 'Today', price: 3100 }
    ]
  }
];

// Today's weather & 5-day forecast
export const MOCK_WEATHER: WeatherData = {
  temperature: 28,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  rainChance: 10,
  soilMoisture: 68,
  forecast: [
    { day: 'Today', temp: 28, icon: 'CloudSun', condition: 'Partly Cloudy' },
    { day: 'Tomorrow', temp: 29, icon: 'Sun', condition: 'Sunny & Clear' },
    { day: 'Wednesday', temp: 27, icon: 'Cloud', condition: 'Mild Overcast' },
    { day: 'Thursday', temp: 26, icon: 'CloudRain', condition: 'Light Showers (15%)' },
    { day: 'Friday', temp: 28, icon: 'Sun', condition: 'Clear Sky' }
  ]
};

// Farming Advisory by Categories
export const MOCK_ADVISORY: Record<string, FarmingAdvisoryCategory> = {
  irrigation: {
    title: 'Water & Irrigation Advisory',
    water: 'Provide 35mm drip cycle early morning (05:30 AM - 07:30 AM) to minimize evapotranspiration.',
    fertilizer: 'Ensure soil moisture reaches 70% before top-dressing with water-soluble nitrogen.',
    pestControl: 'Avoid overhead sprinkler watering to prevent fungal foliar blight on lower tomato leaves.',
    timing: 'Next scheduled deep irrigation: Wednesday 06:00 AM.',
    expertTip: 'Maintain mulch layers of dry straw across tomato rows to reduce moisture loss by 30%.'
  },
  fertilizer: {
    title: 'Soil Nutrition & Fertilizer Plan',
    water: 'Irrigate immediately after urea broadcast to facilitate optimal root nutrient uptake.',
    fertilizer: 'Apply 19:19:19 bio-fertilizer with micronutrient spray (Zinc 21% + Boron 10%).',
    pestControl: 'Organic neem cake application (250 kg/acre) controls root-knot nematodes.',
    timing: 'Fertigate between 09:00 AM and 10:30 AM before soil temperature peaks.',
    expertTip: 'Soil pH is optimal at 6.8. No additional lime or gypsum needed this month.'
  },
  pest: {
    title: 'Pest & Disease Prevention',
    water: 'Maintain well-drained furrows; standing water invites Pythium damp-off.',
    fertilizer: 'Avoid excessive nitrogen which causes lush soft foliage vulnerable to aphids.',
    pestControl: 'Install 6 yellow sticky traps per acre for whiteflies and leaf miners.',
    timing: 'Foliar bio-neem spray recommended during cool dusk hours (05:00 PM).',
    expertTip: 'Regular scouting detected zero fruit borer activity in Sector B.'
  },
  harvest: {
    title: 'Harvest & Post-Harvest Handling',
    water: 'Withhold irrigation 48 hours prior to harvest to enhance fruit firmness and shelf life.',
    fertilizer: 'No chemical sprays within 14 days of plucking (safe withdrawal period).',
    pestControl: 'Sanitize harvest crates with food-grade potassium permanganate wash.',
    timing: 'Pluck fruit at breaker stage (pink blush) between 06:00 AM and 09:30 AM.',
    expertTip: 'Grade harvested tomatoes immediately into Grade-A (crates) for maximum APMC pricing.'
  }
};

// Today's Instructions
export const MOCK_TODAYS_TASKS: TaskInstruction[] = [
  {
    id: 'task_01',
    title: 'Irrigate Tomato Field (Sector A - 3.5 Acres)',
    time: '6:00 AM',
    category: 'Irrigation',
    completed: true,
    notes: 'Drip cycle run for 90 mins with inline filter backwash.'
  },
  {
    id: 'task_02',
    title: 'Apply Fertilizer (NPK 19:19:19 fertigation)',
    time: '9:00 AM',
    category: 'Fertilizer',
    completed: true,
    notes: 'Dosed via Venturi injector at 4 kg per acre.'
  },
  {
    id: 'task_03',
    title: 'Check for Pests & Whiteflies on Capsicum rows',
    time: '11:00 AM',
    category: 'Pest Control',
    completed: true,
    notes: 'Inspected sticky traps. All sectors healthy with low counts.'
  },
  {
    id: 'task_04',
    title: 'Prepare Crates for Tomorrow Early Harvest',
    time: '4:00 PM',
    category: 'Harvest',
    completed: false,
    notes: 'Sanitize 40 plastic field crates for customer orders.'
  },
  {
    id: 'task_05',
    title: 'Soil Moisture Sensor Probe Verification',
    time: '6:00 PM',
    category: 'Field Care',
    completed: false,
    notes: 'Confirm telemetry reading in Sector C potato bed.'
  }
];

// Farm Work Timetable
export const MOCK_TIMETABLE: TimetableScheduleDay[] = [
  {
    day: 'Monday',
    date: 'Sep 21, 2026',
    tasks: [
      { time: '06:00 AM', activity: 'Field Inspection & Boundary Check', tag: 'Field Care' },
      { time: '07:00 AM', activity: 'Irrigation Drip Cycle Sector A & B', tag: 'Irrigation' },
      { time: '09:00 AM', activity: 'Micronutrient Foliar Spray', tag: 'Fertilizer' },
      { time: '11:00 AM', activity: 'Pest Scouting & Sticky Trap Reading', tag: 'Pest Check' },
      { time: '04:00 PM', activity: 'Crop Growth Observation & Leaf Count', tag: 'Inspection' }
    ]
  },
  {
    day: 'Tuesday',
    date: 'Sep 22, 2026',
    tasks: [
      { time: '06:30 AM', activity: 'Tomato Early Morning Selective Plucking', tag: 'Harvest' },
      { time: '08:30 AM', activity: 'Produce Weighing, Grading & Crating', tag: 'Post-Harvest' },
      { time: '10:30 AM', activity: 'Dispatch Direct Customer Orders', tag: 'Logistics' },
      { time: '02:00 PM', activity: 'Weed Removal between Furrows', tag: 'Field Care' },
      { time: '05:00 PM', activity: 'Subsoil Moisture Level Monitoring', tag: 'Irrigation' }
    ]
  },
  {
    day: 'Wednesday',
    date: 'Sep 23, 2026',
    tasks: [
      { time: '06:00 AM', activity: 'Deep Furrow Irrigation in Potato Plots', tag: 'Irrigation' },
      { time: '09:00 AM', activity: 'Vermicompost Top-Dressing Application', tag: 'Fertilizer' },
      { time: '11:30 AM', activity: 'Bio-Fungicide Preventive Root Drench', tag: 'Pest Check' },
      { time: '03:30 PM', activity: 'Drip Emitter Cleaning & Line Flushing', tag: 'Maintenance' },
      { time: '05:00 PM', activity: 'Update Mandi Rate & Farm Stock Log', tag: 'Admin' }
    ]
  },
  {
    day: 'Thursday',
    date: 'Sep 24, 2026',
    tasks: [
      { time: '06:00 AM', activity: 'Soil Health & pH Testing with Mobile Kit', tag: 'Soil Testing' },
      { time: '08:00 AM', activity: 'Mulch Layer Readjustment on Tomato Rows', tag: 'Field Care' },
      { time: '10:30 AM', activity: 'Crop Health Photography & AI Scan', tag: 'AI Check' },
      { time: '02:30 PM', activity: 'Irrigation Filter Backwash & Pump Check', tag: 'Maintenance' },
      { time: '04:30 PM', activity: 'Direct Buyer Inquiries & Packaging Prep', tag: 'Marketplace' }
    ]
  },
  {
    day: 'Friday',
    date: 'Sep 25, 2026',
    tasks: [
      { time: '06:00 AM', activity: 'Harvest Fresh Capsicum & Cherry Tomatoes', tag: 'Harvest' },
      { time: '08:30 AM', activity: 'Cleaning, Sorting & Quality Tagging', tag: 'Quality Check' },
      { time: '11:00 AM', activity: 'Weekly Inventory Audit & Yield Analysis', tag: 'Admin' },
      { time: '03:00 PM', activity: 'Bio-stimulant Seaweed Extract Spray', tag: 'Fertilizer' },
      { time: '05:30 PM', activity: 'Weekend Irrigation Scheduling', tag: 'Irrigation' }
    ]
  }
];

// Customer Products (Marketplace)
export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_tomato_01',
    name: 'Farm Fresh Hybrid Tomato',
    category: 'Vegetables',
    pricePerKg: 24,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_01',
    farmerName: 'Rudra Patel',
    farmName: 'Patel Organic Farms',
    location: 'Surat, Gujarat',
    farmerAvatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 86,
    availableStockKg: 240,
    description: 'Vine-ripened, juicy red tomatoes freshly plucked from drip-irrigated alluvial soil. Free from synthetic pesticides, packed with lycopene and vitamin C.',
    isOrganic: true,
    harvestDate: 'Harvested Today'
  },
  {
    id: 'prod_potato_02',
    name: 'Kufri Jyoti Fresh Potatoes',
    category: 'Vegetables',
    pricePerKg: 30,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_01',
    farmerName: 'Rudra Patel',
    farmName: 'Patel Organic Farms',
    location: 'Surat, Gujarat',
    farmerAvatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewsCount: 64,
    availableStockKg: 380,
    description: 'Firm, golden-skinned potatoes harvested from organic sandy loam. Low moisture content, ideal for roasting, curries, and daily kitchen cooking.',
    isOrganic: true,
    harvestDate: '2 Days Ago'
  },
  {
    id: 'prod_onion_03',
    name: 'Crisp Nashik Red Onions',
    category: 'Vegetables',
    pricePerKg: 28,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_01',
    farmerName: 'Rudra Patel',
    farmName: 'Patel Organic Farms',
    location: 'Surat, Gujarat',
    farmerAvatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviewsCount: 52,
    availableStockKg: 310,
    description: 'Pungent, flavorful and sun-cured deep red onions with long storage shelf life. Directly from farm shed storage with zero chemical sprout inhibitors.',
    isOrganic: true,
    harvestDate: '3 Days Ago'
  },
  {
    id: 'prod_wheat_04',
    name: 'Sharbati Premium Golden Wheat',
    category: 'Grains',
    pricePerKg: 42,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_01',
    farmerName: 'Rudra Patel',
    farmName: 'Patel Organic Farms',
    location: 'Surat, Gujarat',
    farmerAvatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
    rating: 5.0,
    reviewsCount: 110,
    availableStockKg: 850,
    description: 'Golden, heavy grains grown in mineral-rich soil. Yields extremely soft, fragrant rotis and chapatis with rich natural sweetness.',
    isOrganic: true,
    harvestDate: 'Current Season'
  },
  {
    id: 'prod_rice_05',
    name: 'Aromatic Basmati Rice (Aged)',
    category: 'Grains',
    pricePerKg: 85,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_02',
    farmerName: 'Harpreet Singh',
    farmName: 'Punjab Green Acres',
    location: 'Karnal, Haryana',
    farmerAvatar: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 94,
    availableStockKg: 450,
    description: 'Extra-long grain authentic Basmati rice naturally aged for 18 months for fluffy, non-sticky grains with signature floral aroma.',
    isOrganic: true,
    harvestDate: 'Aged 18 Months'
  },
  {
    id: 'prod_capsicum_06',
    name: 'Crisp Green Bell Pepper (Capsicum)',
    category: 'Vegetables',
    pricePerKg: 55,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_01',
    farmerName: 'Rudra Patel',
    farmName: 'Patel Organic Farms',
    location: 'Surat, Gujarat',
    farmerAvatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewsCount: 38,
    availableStockKg: 120,
    description: 'Crisp, thick-walled polyhouse green bell peppers. Packed with vitamin C, antioxidants, and crunch for stir-fries and salads.',
    isOrganic: true,
    harvestDate: 'Plucked Yesterday'
  },
  {
    id: 'prod_mango_07',
    name: 'Alphonso (Hapus) Sweet Mangoes',
    category: 'Fruits',
    pricePerKg: 160,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_03',
    farmerName: 'Ganesh Sawant',
    farmName: 'Konkan Fruit Orchard',
    location: 'Ratnagiri, Maharashtra',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 140,
    availableStockKg: 95,
    description: 'Geographical Indication (GI) certified authentic Alphonso mangoes, tree-ripened naturally without carbide. Rich saffron pulp and honeyed aroma.',
    isOrganic: true,
    harvestDate: 'Fresh Pick'
  },
  {
    id: 'prod_pulses_08',
    name: 'Organic Unpolished Toor Dal',
    category: 'Pulses',
    pricePerKg: 130,
    unit: 'kg',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    farmerId: 'farmer_01',
    farmerName: 'Rudra Patel',
    farmName: 'Patel Organic Farms',
    location: 'Surat, Gujarat',
    farmerAvatar: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewsCount: 78,
    availableStockKg: 260,
    description: 'Pure Desi pigeon peas processed without synthetic oil or leather polish. Cooks quickly with authentic rich dal aroma and high protein density.',
    isOrganic: true,
    harvestDate: 'Current Batch'
  }
];

// Initial Cart items
export const INITIAL_CART_ITEMS = [
  {
    product: MOCK_PRODUCTS[0], // Tomato
    quantityKg: 10
  },
  {
    product: MOCK_PRODUCTS[1], // Potato
    quantityKg: 5
  },
  {
    product: MOCK_PRODUCTS[2], // Onion
    quantityKg: 3
  }
];

// Mock Active Order for tracking
export const MOCK_ACTIVE_ORDER: OrderItem = {
  id: 'ord_fw_9841',
  orderNumber: 'FW-2026-9841',
  date: 'September 18, 2026',
  items: INITIAL_CART_ITEMS,
  subtotal: 474,
  deliveryFee: 40,
  total: 514,
  paymentMethod: 'UPI',
  paymentStatus: 'Paid',
  deliveryAddress: {
    name: 'Aarav Sharma',
    phone: '+91 97234 88120',
    address: 'B-402, Green Orchid Residency, SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054'
  },
  deliveryMethod: 'Standard Delivery',
  currentStatusIndex: 4, // "Out for Delivery"
  farmerName: 'Rudra Patel',
  farmerPhone: '+91 98251 44321'
};

// Preset AI Crop Health scan result
export const DEFAULT_AI_CROP_RESULT: CropHealthAnalysis = {
  cropName: 'Tomato (Solanum lycopersicum)',
  healthStatus: 'Healthy',
  healthPercentage: 92,
  diseaseRisk: 'Low',
  pestRisk: 'Low',
  soilFertility: 'High',
  waterAvailability: 'Optimal',
  weatherStress: 'Minimal',
  imagePreviewUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  detectedIssues: [
    'No fungal leaf blight detected',
    'Chlorophyll density is optimal (SPAD index: 44.8)',
    'Cellular turgor pressure indicates adequate hydration'
  ],
  recommendations: [
    'Monitor leaves regularly for early aphid spotting beneath lower stems',
    'Maintain scheduled morning drip irrigation cycle (35mm)',
    'Check sticky traps in Sector A and maintain 15cm mulch barrier',
    'Continue with scheduled organic bio-neem spray at dusk'
  ]
};

// Aliases for modern dashboard & analysis modules
export const MOCK_TODAYS_INSTRUCTIONS = MOCK_TODAYS_TASKS;

export const MOCK_CROP_HEALTH_ANALYSIS = {
  cropName: 'Tomato (Solanum lycopersicum)',
  diseaseDetected: 'Early Blight (Alternaria solani)',
  severity: 'Moderate',
  confidenceScore: 94.8,
  imagePreviewUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=85',
  symptoms: [
    'Concentric brown rings on lower foliage',
    'Target-pattern spot necrosis',
    'Yellow chlorotic halos around lesions'
  ],
  treatment: {
    organicSolution: 'Cold-Pressed Neem Oil (3000 ppm) + Trichoderma viride bio-fungicide',
    dosage: '5 ml per Liter water foliar spray',
    frequency: 'Every 4 days for 2 cycles at dusk',
    expectedRecoveryDays: 6
  },
  preventativeMeasures: [
    'Prune and safely discard lower infected leaves showing spore coverage',
    'Maintain dry foliage via drip irrigation (avoid overhead sprinkler splash)',
    'Apply 5cm organic straw mulch around plant base to prevent soil spore splash',
    'Ensure 60cm row spacing for optimal air circulation between plants'
  ]
};
