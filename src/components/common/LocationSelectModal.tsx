import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Compass,
  Clock,
  Edit3,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { UserSelectedLocation } from '../../types';
import {
  locationService,
  requestBrowserGeolocation,
  PRESET_LOCATIONS,
} from '../../services/locationService';
import { geocodingService } from '../../services/geocodingService';
import { InteractiveMap } from './InteractiveMap';

interface LocationSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onLocationConfirmed?: (location: UserSelectedLocation) => void;
  initialMode?: 'select' | 'gps' | 'search';
}

export const LocationSelectModal: React.FC<LocationSelectModalProps> = ({
  isOpen,
  onClose,
  title = 'Choose Your Browsing Location',
  onLocationConfirmed,
  initialMode = 'select',
}) => {
  const { selectedLocation, setSelectedLocation } = useCivic();

  // Active sub-mode: 'options' | 'search' | 'manual' | 'confirm'
  const [activeTab, setActiveTab] = useState<'options' | 'search' | 'manual'>('options');
  const [pendingLocation, setPendingLocation] = useState<UserSelectedLocation | null>(
    selectedLocation || null
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSelectedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // GPS state
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Manual entry fields
  const [manualName, setManualName] = useState('');
  const [manualLocality, setManualLocality] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualLat, setManualLat] = useState('12.9716');
  const [manualLng, setManualLng] = useState('77.5946');

  // Recent locations
  const [recentLocations, setRecentLocations] = useState<UserSelectedLocation[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPendingLocation(selectedLocation || null);
      setGpsError(null);
      setSearchQuery('');
      setRecentLocations(locationService.getRecentLocations());
      if (initialMode === 'search') setActiveTab('search');
      else setActiveTab('options');
    }
  }, [isOpen, selectedLocation, initialMode]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await geocodingService.searchLocations(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.warn('Location search failed:', e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  // Option A: Use Current Location
  const handleUseCurrentLocation = async () => {
    setIsGpsLoading(true);
    setGpsError(null);

    try {
      const geo = await requestBrowserGeolocation();
      // Reverse geocode the real coordinates
      const resolved = await geocodingService.reverseGeocode(geo.lat, geo.lng, 'device');

      const loc: UserSelectedLocation = {
        name: resolved.name,
        locality: resolved.locality,
        city: resolved.city,
        state: resolved.state,
        country: resolved.country,
        lat: geo.lat,
        lng: geo.lng,
        accuracy: `±${geo.accuracy} metres · GPS`,
        source: 'device',
        selectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setPendingLocation(loc);
    } catch (err: any) {
      setGpsError(err.message || 'Unable to retrieve location.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Option B: Select from Search Result or Preset
  const handleSelectSearchResult = (item: UserSelectedLocation) => {
    setPendingLocation({
      ...item,
      accuracy: 'Search resolved position',
      source: 'geocoded',
    });
  };

  // Dragging pin on map
  const handleMapPositionChange = async (lat: number, lng: number) => {
    const resolved = await geocodingService.reverseGeocode(lat, lng, 'map_pin');
    setPendingLocation({
      name: resolved.name,
      locality: resolved.locality,
      city: resolved.city,
      lat,
      lng,
      accuracy: 'Pin placed on map',
      source: 'map_pin',
      isCustomManual: true,
    });
  };

  // Manual text entry submit
  const handleApplyManual = () => {
    const lat = parseFloat(manualLat) || 12.9716;
    const lng = parseFloat(manualLng) || 77.5946;
    const loc: UserSelectedLocation = {
      name: manualName.trim() || `${manualLocality || 'Custom'}, ${manualCity || 'Area'}`,
      locality: manualLocality.trim() || 'Custom Locality',
      city: manualCity.trim() || 'Local City',
      lat,
      lng,
      accuracy: 'Typed manual coordinates',
      source: 'manual',
      isCustomManual: true,
    };
    setPendingLocation(loc);
    setActiveTab('options');
  };

  // Final confirmation
  const handleConfirmLocation = () => {
    if (!pendingLocation) {
      alert('Please select or search for a location first.');
      return;
    }

    if (onLocationConfirmed) {
      onLocationConfirmed(pendingLocation);
    } else {
      setSelectedLocation(pendingLocation);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-card" style={{ maxWidth: '640px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={18} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {title}
              </h2>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
              CivicSignal tailors nearby observations, community room discussions, and petition activity to your selected area.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', padding: '4px', borderRadius: '50%' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab selection buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('options')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              backgroundColor: activeTab === 'options' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'options' ? '#fff' : '#475467',
              transition: 'all 0.15s ease',
            }}
          >
            Options & Presets
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              backgroundColor: activeTab === 'search' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'search' ? '#fff' : '#475467',
              transition: 'all 0.15s ease',
            }}
          >
            Search Neighborhood
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              backgroundColor: activeTab === 'manual' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'manual' ? '#fff' : '#475467',
              transition: 'all 0.15s ease',
            }}
          >
            Manual Entry
          </button>
        </div>

        {/* GPS Error Alert */}
        {gpsError && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{gpsError}</span>
          </div>
        )}

        {/* TAB 1: Primary Options (Option A + Presets) */}
        {activeTab === 'options' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Option A: Use Current Location */}
            <div
              style={{
                border: '1.5px solid #0284c7',
                borderRadius: '12px',
                padding: '14px 16px',
                backgroundColor: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: '#0369a1' }}>
                  <Navigation size={16} />
                  <span>Option A: Use My Current Location</span>
                </div>
                <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px' }}>
                  Requests browser GPS with high accuracy and reverse-geocodes your actual neighborhood.
                </div>
              </div>
              <button
                onClick={handleUseCurrentLocation}
                disabled={isGpsLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                {isGpsLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Acquiring...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={14} />
                    <span>Detect Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Switch / Presets */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Preset Neighborhoods & Demo Areas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PRESET_LOCATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectSearchResult(preset)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: pendingLocation?.name === preset.name ? '#ff4500' : '#f8fafc',
                      color: pendingLocation?.name === preset.name ? '#fff' : '#334155',
                      border: '1px solid',
                      borderColor: pendingLocation?.name === preset.name ? '#ff4500' : '#e2e8f0',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    📍 {preset.locality} {preset.source === 'sample' ? '(Demo Area)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Recently Browsed
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {recentLocations.map((rec) => (
                    <div
                      key={rec.name}
                      onClick={() => handleSelectSearchResult(rec)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} color="#64748b" />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{rec.locality}</span>
                        <span style={{ color: '#64748b' }}>· {rec.city}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{rec.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Search (Option B) */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by neighborhood, street, landmark, city, or postal code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {isSearching && (
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ position: 'absolute', right: '12px', top: '12px', color: '#0284c7' }}
                />
              )}
            </div>

            {/* Results list */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {searchResults.length === 0 && searchQuery.trim().length > 2 && !isSearching && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No locations found matching "{searchQuery}". You can enter address manually or place a map pin.
                </div>
              )}
              {searchResults.map((res, idx) => (
                <div
                  key={`${res.name}-${idx}`}
                  onClick={() => handleSelectSearchResult(res)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: pendingLocation?.lat === res.lat && pendingLocation?.lng === res.lng ? '#eff6ff' : '#fff',
                    borderColor: pendingLocation?.lat === res.lat && pendingLocation?.lng === res.lng ? '#93c5fd' : '#e2e8f0',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{res.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {res.locality}, {res.city} {res.state ? `· ${res.state}` : ''} ({res.lat.toFixed(4)}, {res.lng.toFixed(4)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Manual Entry */}
        {activeTab === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-row-2col">
              <div>
                <label className="form-label">Neighborhood / Locality</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Koramangala or Connaught Place"
                  value={manualLocality}
                  onChange={(e) => setManualLocality(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bengaluru or New Delhi"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Location / Street / Area Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 80ft Road, 4th Block"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>

            <div className="form-row-2col">
              <div>
                <label className="form-label">Latitude</label>
                <input
                  type="text"
                  className="form-input"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Longitude</label>
                <input
                  type="text"
                  className="form-input"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleApplyManual}
              style={{
                alignSelf: 'flex-start',
                padding: '6px 14px',
                backgroundColor: '#0284c7',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                marginTop: '4px',
              }}
            >
              Apply Coordinates & Preview
            </button>
          </div>
        )}

        {/* Selected Location Preview Box & Map */}
        {pendingLocation && (
          <div
            style={{
              marginTop: '16px',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Target Browsing Location
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                  {pendingLocation.locality}, {pendingLocation.city}
                </div>
                <div style={{ fontSize: '11.5px', color: '#475467' }}>
                  {pendingLocation.name} · {pendingLocation.lat.toFixed(4)}° N, {pendingLocation.lng.toFixed(4)}° E
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: pendingLocation.source === 'device' ? '#dcfce7' : '#f1f5f9',
                  color: pendingLocation.source === 'device' ? '#15803d' : '#475467',
                }}
              >
                {pendingLocation.source === 'device'
                  ? 'Live Device GPS'
                  : pendingLocation.source === 'map_pin'
                  ? 'Map Pin'
                  : pendingLocation.source === 'sample'
                  ? 'Demo Reference'
                  : 'Geocoded'}
              </span>
            </div>

            {/* Interactive Map Preview */}
            <div style={{ height: '170px', position: 'relative' }}>
              <InteractiveMap
                lat={pendingLocation.lat}
                lng={pendingLocation.lng}
                onPositionChange={handleMapPositionChange}
                isDraggable={true}
              />
            </div>
            <div style={{ padding: '6px 12px', fontSize: '11px', color: '#64748b', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0' }}>
              Tip: Drag the pin or click on the map to fine-tune the exact neighborhood coordinates.
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#64748b',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLocation}
            disabled={!pendingLocation}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              backgroundColor: pendingLocation ? '#ff4500' : '#cbd5e1',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: pendingLocation ? '0 2px 6px rgba(255, 69, 0, 0.35)' : 'none',
              cursor: pendingLocation ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle size={15} />
            <span>Confirm & Set Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
