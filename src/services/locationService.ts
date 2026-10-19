import { UserSelectedLocation, LocationSource, LocationData } from '../types';

export const BROWSING_LOCATION_KEY = 'civicsignal_browsing_location_v3';
export const RECENT_LOCATIONS_KEY = 'civicsignal_recent_locations_v3';

export interface GeolocationResult {
  lat: number;
  lng: number;
  accuracy: number;
}

/**
 * Calculates geographic distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Human-readable distance format: e.g. "450 m" or "2.4 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.max(10, Math.round(km * 1000));
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Requests device GPS position only when explicitly user-initiated.
 * Handles permission denied, timeout, unavailable device, and unsupported browsers.
 */
export async function requestBrowserGeolocation(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Browser geolocation is not supported on this device or environment.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        let msg = 'Unable to determine your location.';
        if (err.code === 1) {
          msg = 'Location permission was denied. You can search for your neighborhood manually or place a map pin.';
        } else if (err.code === 2) {
          msg = 'Location position is currently unavailable from your device. Try manual search.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again or search manually.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Curated preset / demo locations for quick switching and fallback
 */
export const PRESET_LOCATIONS: UserSelectedLocation[] = [
  {
    name: 'Knowledge Park III, Greater Noida',
    locality: 'Knowledge Park III',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    lat: 28.4619,
    lng: 77.4988,
    accuracy: '±15m',
    source: 'sample',
  },
  {
    name: 'Basavanagudi, Bengaluru',
    locality: 'Basavanagudi',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9416,
    lng: 77.5655,
    accuracy: '±15m',
    source: 'sample',
  },
  {
    name: 'Koramangala, Bengaluru',
    locality: 'Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9352,
    lng: 77.6245,
    accuracy: '±25m',
    source: 'geocoded',
  },
  {
    name: 'Indiranagar, Bengaluru',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9784,
    lng: 77.6408,
    accuracy: '±20m',
    source: 'geocoded',
  },
  {
    name: 'Connaught Place, New Delhi',
    locality: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    lat: 28.6315,
    lng: 77.2167,
    accuracy: '±30m',
    source: 'geocoded',
  },
  {
    name: 'Bandra West, Mumbai',
    locality: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0596,
    lng: 72.8295,
    accuracy: '±30m',
    source: 'geocoded',
  },
];

export const locationService = {
  getStoredLocation(): UserSelectedLocation | null {
    try {
      const stored = localStorage.getItem(BROWSING_LOCATION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read browsing location from localStorage', e);
    }
    return null;
  },

  saveStoredLocation(loc: UserSelectedLocation): void {
    try {
      localStorage.setItem(BROWSING_LOCATION_KEY, JSON.stringify(loc));
      this.addRecentLocation(loc);
    } catch (e) {
      console.warn('Could not save browsing location to localStorage', e);
    }
  },

  clearStoredLocation(): void {
    try {
      localStorage.removeItem(BROWSING_LOCATION_KEY);
    } catch (e) {}
  },

  getRecentLocations(): UserSelectedLocation[] {
    try {
      const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return PRESET_LOCATIONS.slice(0, 3);
  },

  addRecentLocation(loc: UserSelectedLocation): void {
    try {
      const recents = this.getRecentLocations();
      const filtered = recents.filter(
        (r) =>
          calculateDistanceKm(r.lat, r.lng, loc.lat, loc.lng) > 0.5 &&
          r.locality.toLowerCase() !== loc.locality.toLowerCase()
      );
      const updated = [loc, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },
};
