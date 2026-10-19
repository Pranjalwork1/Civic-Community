import React, { useState, useEffect } from 'react';
import {
  MapPin,
  RefreshCw,
  Edit3,
  CheckCircle,
  AlertCircle,
  Info,
  Navigation,
  Search,
  Loader2,
  Compass,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { LocationData, LocationSource, UserSelectedLocation } from '../../types';
import { requestBrowserGeolocation, calculateDistanceKm } from '../../services/locationService';
import { geocodingService } from '../../services/geocodingService';
import { GeotagImageService } from '../../services/geotagImageService';

export const Step2ConfirmLocation: React.FC = () => {
  const { reportDraft, updateDraft, setWizardStep, selectedLocation } = useCivic();

  // Initialize from existing draft location, or fallback to browsing location / neutral position
  const [location, setLocation] = useState<LocationData>(() => {
    if (reportDraft.location) {
      return reportDraft.location;
    }
    if (selectedLocation) {
      return {
        name: selectedLocation.name,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        landmark: `Near ${selectedLocation.locality}`,
        locality: selectedLocation.locality,
        city: selectedLocation.city,
        accuracy: 'Browsing area reference',
        source: selectedLocation.source === 'sample' ? 'sample' : 'geocoded',
        isConfirmed: false,
      };
    }
    return {
      name: 'Unspecified issue location',
      lat: 12.9716,
      lng: 77.5946,
      landmark: 'Please search or place pin',
      locality: 'Select Locality',
      city: 'Local Area',
      accuracy: 'Uncalibrated',
      source: 'manual',
      isConfirmed: false,
    };
  });

  const [isEditingManual, setIsEditingManual] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSelectedLocation[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(Boolean(reportDraft.location?.isConfirmed));

  // Debounced search for issue location
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await geocodingService.searchLocations(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.warn('Geocoding search failed:', e);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When pin is adjusted on map
  const handlePositionChange = async (lat: number, lng: number) => {
    try {
      const resolved = await geocodingService.reverseGeocode(lat, lng, 'map_pin');
      const updated: LocationData = {
        name: resolved.name,
        lat,
        lng,
        landmark: location.landmark || resolved.name,
        locality: resolved.locality,
        city: resolved.city,
        source: 'map_pin',
        accuracy: 'Selected on map pin (device GPS not used)',
        isConfirmed: true,
      };
      setLocation(updated);
      setIsConfirmed(true);
      updateDraft({ location: updated });
    } catch (e) {
      const updated: LocationData = {
        ...location,
        lat,
        lng,
        source: 'map_pin',
        accuracy: 'Adjusted by user pin placement',
        isConfirmed: true,
      };
      setLocation(updated);
      setIsConfirmed(true);
      updateDraft({ location: updated });
    }
  };

  // Option A: Use Device GPS
  const handleRefreshLocation = async () => {
    setGpsLoading(true);
    setGpsError(null);

    try {
      const geo = await requestBrowserGeolocation();
      const resolved = await geocodingService.reverseGeocode(geo.lat, geo.lng, 'device');

      const updated: LocationData = {
        name: resolved.name,
        lat: geo.lat,
        lng: geo.lng,
        landmark: location.landmark && location.landmark !== 'Opposite the main college entrance'
          ? location.landmark
          : resolved.name,
        locality: resolved.locality,
        city: resolved.city,
        accuracy: `±${geo.accuracy} metres · Device GPS`,
        source: 'device',
        isConfirmed: true,
      };

      setLocation(updated);
      setIsConfirmed(true);
      updateDraft({ location: updated });
    } catch (err: any) {
      console.warn('Geolocation failed:', err);
      setGpsError(err.message || 'Unable to retrieve location coordinates. You can place a pin or search.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Option B: Select search result
  const handleSelectSearchResult = (result: UserSelectedLocation) => {
    const updated: LocationData = {
      name: result.name,
      lat: result.lat,
      lng: result.lng,
      landmark: result.name,
      locality: result.locality,
      city: result.city,
      accuracy: 'Search resolved position',
      source: 'geocoded',
      isConfirmed: true,
    };
    setLocation(updated);
    setIsConfirmed(true);
    updateDraft({ location: updated });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Option D: Save manual text edits
  const handleSaveManualLocation = () => {
    const updated: LocationData = {
      ...location,
      source: 'manual',
      accuracy: 'Manually typed address (no GPS)',
      isConfirmed: true,
    };
    setLocation(updated);
    setIsConfirmed(true);
    updateDraft({ location: updated });
    setIsEditingManual(false);
  };

  const handleContinue = async () => {
    const finalizedLocation: LocationData = {
      ...location,
      isConfirmed: true,
    };

    // Update geotagged evidence variant with the confirmed coordinates and landmark
    const updatedEvidence = await Promise.all(
      reportDraft.evidence.map(async (ev) => {
        try {
          const geotagged = await GeotagImageService.generateGeotaggedImage({
            imageUrl: ev.url,
            reporterName: ev.contributorName,
            hideIdentity: ev.hideIdentityOnOverlay,
            location: finalizedLocation,
            customLandmark: finalizedLocation.landmark,
          });
          return {
            ...ev,
            geotaggedUrl: geotagged.dataUrl,
            locationData: finalizedLocation,
            locationConfirmed: true,
          };
        } catch (err) {
          console.warn('Geotag variant update failed in Step 2:', err);
          return {
            ...ev,
            locationData: finalizedLocation,
            locationConfirmed: true,
          };
        }
      })
    );

    updateDraft({
      location: finalizedLocation,
      evidence: updatedEvidence,
    });
    setWizardStep(3);
  };

  const getSourceDisplayLabel = (src: LocationSource) => {
    switch (src) {
      case 'device':
        return 'Device GPS';
      case 'geocoded':
        return 'Geocoded address';
      case 'map_pin':
        return 'Manually placed map pin';
      case 'manual':
        return 'Manual address entry';
      case 'sample':
        return 'Sample reference data';
      default:
        return 'Citizen supplied';
    }
  };

  return (
    <div className="wizard-container">
      {/* Top Header */}
      <div className="wizard-top-header">
        <div className="wizard-breadcrumb">REPORT A CIVIC ISSUE / STEP 2 OF 4</div>
        <div className="wizard-title-row">
          <h1 className="wizard-main-title">Put the issue in the right place.</h1>
          <button
            className="wizard-save-draft"
            onClick={() => alert('Location draft saved to browser storage!')}
          >
            Save Draft
          </button>
        </div>
        <div className="wizard-subtitle">
          A precise, reviewed pin helps neighbours and civic authorities recognise the exact incident.
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="wizard-stepper">
        <div className="step-indicator-item completed">
          <div className="step-number-circle">✓</div>
          <span>Capture evidence</span>
        </div>
        <div className="step-indicator-item active">
          <div className="step-number-circle">2</div>
          <span>Confirm location</span>
        </div>
        <div className="step-indicator-item">
          <div className="step-number-circle">3</div>
          <span>Add details</span>
        </div>
        <div className="step-indicator-item">
          <div className="step-number-circle">4</div>
          <span>Review & publish</span>
        </div>
      </div>

      {/* Section Title & Dynamic Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Review the issue location</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: location.source === 'device' ? '#dcfce7' : '#f1f5f9',
              color: location.source === 'device' ? '#15803d' : '#475467',
              border: location.source === 'device' ? '1px solid #bbf7d0' : 'none',
            }}
          >
            Source: {getSourceDisplayLabel(location.source)}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: isConfirmed ? '#ecfdf5' : '#fffbeb',
              color: isConfirmed ? '#047857' : '#b45309',
              border: isConfirmed ? '1px solid #a7f3d0' : '1px solid #fde68a',
            }}
          >
            {isConfirmed ? '✓ Location confirmed' : 'Needs your confirmation'}
          </span>
        </div>
      </div>

      {/* Search Input for Issue Location */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', height: '36px', fontSize: '13px' }}
              placeholder="Search neighborhood, street, or landmark where the issue occurred..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={{ fontSize: '12px', color: '#64748b' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              zIndex: 30,
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            {searchResults.map((res, i) => (
              <div
                key={i}
                onClick={() => handleSelectSearchResult(res)}
                style={{
                  padding: '8px 12px',
                  borderBottom: i < searchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                }}
              >
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{res.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {res.locality}, {res.city} ({res.lat.toFixed(4)}, {res.lng.toFixed(4)})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive OpenStreetMap */}
      <InteractiveMap
        lat={location.lat}
        lng={location.lng}
        onPositionChange={handlePositionChange}
        isDraggable={true}
      />

      {gpsError && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Location Details Grid (Exact Figma PDF) */}
      <div className="location-fields-grid">
        <div className="location-field-box">
          <div className="field-label">Location name</div>
          <div className="field-value" style={{ wordBreak: 'break-word' }}>{location.name}</div>
        </div>

        <div className="location-field-box">
          <div className="field-label">Coordinates</div>
          <div className="field-value">
            {location.lat}° N, {location.lng}° E
          </div>
        </div>

        <div className="location-field-box">
          <div className="field-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Nearest Landmark</span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>Editable</span>
          </div>
          <input
            type="text"
            className="form-input"
            style={{ marginTop: '4px', padding: '4px 8px', fontSize: '12.5px', height: '28px' }}
            placeholder="e.g. Near college entrance, opposite shop"
            value={location.landmark || ''}
            onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
          />
        </div>

        <div className="location-field-box">
          <div className="field-label">Locality / city</div>
          <div className="field-value">
            {location.locality} / {location.city}
          </div>
        </div>
      </div>

      {/* Accuracy & Source Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', color: '#475467' }}>
          <span style={{ fontWeight: 600 }}>Accuracy: </span>
          {location.accuracy || 'Standard precision'}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          Source:{' '}
          <span style={{ fontWeight: 600, color: '#475467' }}>
            {getSourceDisplayLabel(location.source)}
          </span>
        </div>
      </div>

      <div className="location-source-notice">
        {location.source === 'device' ? (
          'Coordinates obtained from device GPS. You may fine-tune the pin placement if needed.'
        ) : location.source === 'sample' ? (
          'Sample reference coordinates from demo design. Adjust pin or click Use My Current Location for real coordinates.'
        ) : (
          'Coordinates supplied manually by citizen. Device GPS accuracy is unavailable.'
        )}
      </div>

      {/* Action Buttons Row (Exact Figma PDF) */}
      <div className="location-actions-bar">
        <button className="btn-outline-location" onClick={handleRefreshLocation} disabled={gpsLoading}>
          <RefreshCw size={14} className={gpsLoading ? 'animate-spin' : ''} />
          <span>{gpsLoading ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
        </button>

        <button
          className="btn-outline-location"
          onClick={() => alert('Pin placement active! Drag the blue marker or click anywhere on the map to place the issue pin.')}
        >
          <Navigation size={14} />
          <span>Adjust Pin on Map</span>
        </button>

        <button className="btn-outline-location" onClick={() => setIsEditingManual(!isEditingManual)}>
          <Edit3 size={14} />
          <span>Enter Location Manually</span>
        </button>
      </div>

      {/* Manual Address Editor Form (if opened) */}
      {isEditingManual && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
            Manual Address / Landmark Entry
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="form-label">Location / Street Name</label>
              <input
                type="text"
                className="form-input"
                value={location.name}
                onChange={(e) => setLocation({ ...location, name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Nearest Landmark</label>
              <input
                type="text"
                className="form-input"
                value={location.landmark}
                onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="form-label">Locality / Neighborhood</label>
              <input
                type="text"
                className="form-input"
                value={location.locality}
                onChange={(e) => setLocation({ ...location, locality: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
              />
            </div>
          </div>
          <button
            style={{
              backgroundColor: '#0284c7',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '6px',
            }}
            onClick={handleSaveManualLocation}
          >
            Apply Manual Address
          </button>
        </div>
      )}

      {/* Confirm Notice Callout (Exact Figma PDF) */}
      <div className="location-confirm-alert">
        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <Info size={15} />
          <span>Confirm before continuing</span>
        </div>
        <div>
          The pin should mark the issue, not your home or current position. Reviewed address: {location.name}.
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="wizard-footer-nav">
        <button className="btn-wizard-back" onClick={() => setWizardStep(1)}>
          Back to evidence
        </button>
        <button className="btn-wizard-continue" onClick={handleContinue}>
          Confirm location & continue
        </button>
      </div>
    </div>
  );
};
