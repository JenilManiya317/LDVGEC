import { ProductItem } from './types';
import { MOCK_PRODUCTS } from './mock-data';

const CUSTOM_LISTINGS_KEY = 'agrisetu_custom_listings_v1';

/**
 * Retrieve user-created crop listings from localStorage.
 */
export function getCustomListings(): ProductItem[] {
  try {
    const saved = localStorage.getItem(CUSTOM_LISTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading custom listings:', err);
  }
  return [];
}

/**
 * Save a newly published crop listing to localStorage at the front of the list.
 */
export function saveCustomListing(listing: ProductItem): void {
  try {
    const existing = getCustomListings();
    // Prepend new listing so it appears first in the marketplace
    const updated = [listing, ...existing.filter((item) => item.id !== listing.id)];
    localStorage.setItem(CUSTOM_LISTINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving custom listing:', err);
  }
}

/**
 * Get all marketplace products combining custom listings, backend listings, and mock products.
 */
export function getMergedProducts(backendProducts: ProductItem[] = []): ProductItem[] {
  const custom = getCustomListings();
  const map = new Map<string, ProductItem>();

  // 1. Custom local listings (highest priority)
  for (const item of custom) {
    map.set(item.id, item);
  }

  // 2. Backend products
  for (const item of backendProducts) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  // 3. Fallback mock products
  for (const item of MOCK_PRODUCTS) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}

/**
 * Find a product by ID across custom listings, backend listings, and mock products.
 */
export function findProductById(id: string): ProductItem | undefined {
  const custom = getCustomListings();
  const foundInCustom = custom.find((p) => p.id === id);
  if (foundInCustom) return foundInCustom;

  return MOCK_PRODUCTS.find((p) => p.id === id);
}
