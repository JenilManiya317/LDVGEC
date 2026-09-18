export type UserRole = 'farmer' | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location: string;
  avatar: string;
  farmName?: string;
  totalArea?: string;
  rating?: number;
  reviewsCount?: number;
}

export interface FarmDetails {
  id: string;
  name: string;
  totalArea: number; // in acres
  state: string;
  district: string;
  soilType: string;
  irrigationType: string;
  location: string;
  activeCrops: string[];
}

export interface CropData {
  id: string;
  name: string;
  variety: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Whole Year';
  state: string;
  area: number; // in acres
  production: number; // in tons
  rainfall: number; // in mm
  fertilizer: string;
  pesticide: string;
  yield: number; // quintals per acre
  temperature: number; // in °C
  humidity: number; // in %
  soilType: string;
  soilPh: number;
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  soilMoisture: number; // in %
  irrigation: string;
  sowingMonth: string;
  harvestMonth: string;
  growingDays: number;
  soilFertility: 'High' | 'Medium' | 'Low';
  pestRisk: 'Low' | 'Medium' | 'High';
  diseaseRisk: 'Low' | 'Medium' | 'High';
  waterAvailability: 'Optimal' | 'Adequate' | 'Deficit';
  weatherStress: 'Low' | 'Moderate' | 'Severe';
  cropHealthPercentage: number;
  healthStatus: 'Healthy' | 'Needs Attention' | 'At Risk';
  imageUrl: string;
}

export interface MarketPriceItem {
  id: string;
  cropName: string;
  currentPrice: number; // in ₹ / quintal
  previousPrice: number;
  trendPercentage: number; // e.g. +8.4%
  isPositive: boolean;
  marketLocation: string;
  mandiLocation?: string;
  lastUpdated: string;
  priceHistory: { day: string; price: number }[];
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  soilMoisture?: number;
  forecast: { day: string; temp: number; icon: string; condition: string }[];
}

export interface FarmingAdvisoryCategory {
  title: string;
  water: string;
  fertilizer: string;
  pestControl: string;
  timing: string;
  expertTip: string;
  priority?: string;
  description?: string;
  action?: string;
}

export interface TaskInstruction {
  id: string;
  title: string;
  time: string;
  category: 'Irrigation' | 'Fertilizer' | 'Pest Control' | 'Harvest' | 'Field Care';
  completed: boolean;
  notes?: string;
  task?: string;
  crop?: string;
  timeSlot?: string;
  priority?: string;
}

export interface TimetableScheduleDay {
  day: string;
  date: string;
  tasks: {
    time: string;
    activity: string;
    tag: string;
  }[];
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Organic';
  pricePerKg: number;
  unit: string;
  imageUrl: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  location: string;
  farmerAvatar: string;
  rating: number;
  reviewsCount: number;
  availableStockKg: number;
  quantityAvailableKg?: number;
  description: string;
  variety?: string;
  farmerPhone?: string;
  isOrganic?: boolean;
  harvestDate: string;
}

export interface CartItem {
  product: ProductItem;
  quantityKg: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending';
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryMethod: 'Standard Delivery' | 'Farmer Pickup';
  currentStatusIndex: number; // 0: Placed, 1: Paid, 2: Farmer Accepted, 3: Packed, 4: Out for delivery, 5: Delivered
  farmerName: string;
  farmerPhone: string;
}

export interface CropHealthAnalysis {
  cropName: string;
  healthStatus: 'Healthy' | 'Mild Infection' | 'Pest Detected';
  healthPercentage: number;
  diseaseRisk: 'Low' | 'Moderate' | 'High';
  pestRisk: 'Low' | 'Moderate' | 'High';
  soilFertility: 'High' | 'Medium' | 'Low';
  waterAvailability: 'Optimal' | 'Moderate' | 'Stressed';
  weatherStress: 'Minimal' | 'Moderate' | 'Severe';
  imagePreviewUrl: string;
  detectedIssues: string[];
  recommendations: string[];
}
