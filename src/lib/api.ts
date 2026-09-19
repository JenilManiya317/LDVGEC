/**
 * FarmWise API Client — Centralized HTTP client for the FastAPI backend.
 * Handles authentication tokens, error handling, and response typing.
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Get the stored JWT token from localStorage.
 */
function getToken(): string | null {
  return localStorage.getItem('farmwise_token');
}

/**
 * Store the JWT token in localStorage.
 */
export function setToken(token: string): void {
  localStorage.setItem('farmwise_token', token);
}

/**
 * Remove the JWT token from localStorage.
 */
export function clearToken(): void {
  localStorage.removeItem('farmwise_token');
}

/**
 * Build request headers with optional auth token.
 */
function buildHeaders(isJson: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * API response wrapper.
 */
interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Generic fetch wrapper with error handling.
 */
async function request<T = any>(
  method: string,
  path: string,
  body?: any,
  isJson: boolean = true,
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${path}`;
    const options: RequestInit = {
      method,
      headers: buildHeaders(isJson),
    };

    if (body && isJson) {
      options.body = JSON.stringify(body);
    } else if (body) {
      options.body = body;
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: data?.detail || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || 'Network error — is the backend running?',
      status: 0,
    };
  }
}

/**
 * Upload a file (multipart form data).
 */
async function uploadFile<T = any>(
  path: string,
  file: File,
  fieldName: string = 'image',
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${path}`;
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: data?.detail || `Upload failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || 'Upload failed — is the backend running?',
      status: 0,
    };
  }
}

/**
 * FarmWise API methods.
 */
export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T = any>(path: string, body?: any) => request<T>('PUT', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),
  upload: <T = any>(path: string, file: File, fieldName?: string) =>
    uploadFile<T>(path, file, fieldName),

  // --- Auth ---
  auth: {
    register: (data: {
      name: string;
      email: string;
      password: string;
      role: 'farmer' | 'customer';
      phone?: string;
      location?: string;
      avatar?: string;
      farm_name?: string;
      total_area?: string;
    }) => request('POST', '/api/auth/register', data),

    login: (email: string, password: string) =>
      request('POST', '/api/auth/login', { email, password }),

    getProfile: () => request('GET', '/api/auth/profile'),

    updateProfile: (data: Record<string, any>) =>
      request('PUT', '/api/auth/profile', data),
  },

  // --- Farmer & Farm Profiles ---
  farm: {
    getProfile: () => request('GET', '/api/farmer/farm'),
    updateProfile: (data: Record<string, any>) => request('PUT', '/api/farmer/farm', data),
    getCrops: () => request('GET', '/api/farmer/crops'),
    addCrop: (data: Record<string, any>) => request('POST', '/api/farmer/crops', data),
    deleteCrop: (cropId: string) => request('DELETE', `/api/farmer/crops/${cropId}`),
  },

  // --- Yield Prediction ---
  predict: {
    yield: (data: Record<string, any>) =>
      request('POST', '/api/predict/yield', data),

    history: () => request('GET', '/api/predict/history'),

    features: () => request('GET', '/api/predict/features'),

    modelInfo: () => request('GET', '/api/predict/model-info'),
  },

  // --- Crop Health ---
  cropHealth: {
    analyze: (imageFile: File) =>
      uploadFile('/api/crop-health/analyze', imageFile, 'image'),

    history: () => request('GET', '/api/crop-health/history'),
  },

  // --- Weather ---
  weather: {
    current: (state: string = 'Gujarat', location: string = 'Surat') =>
      request('GET', `/api/weather/current?state=${encodeURIComponent(state)}&location=${encodeURIComponent(location)}`),

    forecast: (state: string = 'Gujarat', days: number = 7) =>
      request('GET', `/api/weather/forecast?state=${encodeURIComponent(state)}&days=${days}`),

    advisory: (state: string = 'Gujarat', crop: string = 'Rice', season: string = 'Kharif') =>
      request('GET', `/api/weather/advisory?state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}&season=${encodeURIComponent(season)}`),
  },

  // --- Market Prices ---
  market: {
    prices: (search: string = '', limit: number = 20) =>
      request('GET', `/api/market-prices?search=${encodeURIComponent(search)}&limit=${limit}`),

    cropPrice: (cropName: string) =>
      request('GET', `/api/market-prices/${encodeURIComponent(cropName)}`),
  },

  // --- Marketplace ---
  marketplace: {
    listings: (category: string = '', search: string = '') =>
      request('GET', `/api/marketplace/listings?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`),

    getListing: (id: string | number) =>
      request('GET', `/api/marketplace/listings/${id}`),

    createListing: (data: Record<string, any>) =>
      request('POST', '/api/marketplace/listings', data),

    updateListing: (id: string | number, data: Record<string, any>) =>
      request('PUT', `/api/marketplace/listings/${id}`, data),

    deleteListing: (id: string | number) =>
      request('DELETE', `/api/marketplace/listings/${id}`),
  },

  // --- Orders ---
  orders: {
    create: (data: Record<string, any>) =>
      request('POST', '/api/orders', data),

    list: () => request('GET', '/api/orders'),

    get: (id: string | number) => request('GET', `/api/orders/${id}`),

    updateStatus: (id: string | number, statusIndex: number) =>
      request('PUT', `/api/orders/${id}/status`, { current_status_index: statusIndex }),
  },

  // --- Reviews ---
  reviews: {
    create: (orderId: string | number, rating: number, comment: string = '') =>
      request('POST', '/api/reviews', { order_id: orderId, rating, comment }),
  },
};
