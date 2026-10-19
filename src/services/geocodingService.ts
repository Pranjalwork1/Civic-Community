import { UserSelectedLocation, LocationSource, LocationData } from '../types';
import { PRESET_LOCATIONS } from './locationService';

// In-memory caches to respect OSM usage policy & eliminate redundant network requests
const reverseCache = new Map<string, Partial<UserSelectedLocation>>();
const searchCache = new Map<string, UserSelectedLocation[]>();

let lastRequestTimestamp = 0;
const MIN_REQUEST_INTERVAL_MS = 500; // Rate limit protection

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTimestamp;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestTimestamp = Date.now();

  return fetch(url, {
    headers: {
      'Accept-Language': 'en',
    },
  });
}

export const geocodingService = {
  /**
   * Reverse-geocodes latitude and longitude into readable locality, city, state, and address.
   */
  async reverseGeocode(
    lat: number,
    lng: number,
    source: LocationSource = 'geocoded'
  ): Promise<UserSelectedLocation> {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (reverseCache.has(key)) {
      const cached = reverseCache.get(key)!;
      return {
        lat,
        lng,
        name: cached.name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        locality: cached.locality || 'Detected Area',
        city: cached.city || 'Local Area',
        state: cached.state,
        country: cached.country,
        source,
      };
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await rateLimitedFetch(url);

      if (!res.ok) {
        throw new Error(`OSM Nominatim returned status ${res.status}`);
      }

      const data = await res.json();
      const addr = data.address || {};

      // Smart locality resolution priority
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.city_district ||
        addr.quarter ||
        addr.village ||
        addr.town ||
        addr.city ||
        'Local Area';

      // Smart city resolution
      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.county ||
        addr.state_district ||
        addr.state ||
        'Civic Signal Area';

      const road = addr.road || addr.pedestrian || addr.footway || '';
      const name = road
        ? `${road}, ${locality}`
        : `${locality}, ${city}`;

      const result: UserSelectedLocation = {
        name,
        locality,
        city,
        state: addr.state,
        country: addr.country,
        lat,
        lng,
        source,
      };

      reverseCache.set(key, result);
      return result;
    } catch (err) {
      console.warn('Geocoding service reverse lookup warning:', err);

      // Graceful fallback without hardcoded fake values
      return {
        name: `Location at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
        locality: 'Pinned Location',
        city: 'Selected Region',
        lat,
        lng,
        source: source === 'device' ? 'device' : 'manual',
        isCustomManual: true,
      };
    }
  },

  /**
   * Searches locations matching a query string (neighborhood, city, landmark, street, postal code)
   */
  async searchLocations(query: string): Promise<UserSelectedLocation[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    // 1. Instant preset matches
    const presetMatches = PRESET_LOCATIONS.filter(
      (p) =>
        p.name.toLowerCase().includes(cleanQuery) ||
        p.locality.toLowerCase().includes(cleanQuery) ||
        p.city.toLowerCase().includes(cleanQuery)
    );

    // 2. Check cache
    if (searchCache.has(cleanQuery)) {
      return searchCache.get(cleanQuery)!;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        cleanQuery
      )}&addressdetails=1&limit=6`;
      const res = await rateLimitedFetch(url);

      if (!res.ok) {
        return presetMatches;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        return presetMatches;
      }

      const results: UserSelectedLocation[] = data.map((item: any) => {
        const addr = item.address || {};
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.city_district ||
          addr.village ||
          addr.town ||
          item.name ||
          'Local Area';

        const city =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.county ||
          addr.state ||
          '';

        return {
          name: item.display_name.split(',').slice(0, 3).join(',').trim(),
          locality,
          city,
          state: addr.state,
          country: addr.country,
          lat: Number(parseFloat(item.lat).toFixed(6)),
          lng: Number(parseFloat(item.lon).toFixed(6)),
          source: 'geocoded' as LocationSource,
        };
      });

      // Merge with any preset match that might not be in results
      const combined = [...results];
      for (const p of presetMatches) {
        if (!combined.some((c) => c.locality.toLowerCase() === p.locality.toLowerCase())) {
          combined.push(p);
        }
      }

      searchCache.set(cleanQuery, combined);
      return combined;
    } catch (err) {
      console.warn('Geocoding service search warning:', err);
      return presetMatches;
    }
  },
};
