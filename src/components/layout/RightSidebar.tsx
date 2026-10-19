import React from 'react';
import {
  Activity,
  MapPin,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { calculateDistanceKm, formatDistance } from '../../services/locationService';

export const RightSidebar: React.FC = () => {
  const {
    activeView,
    wizardStep,
    reportDraft,
    incidents,
    setCurrentIncidentId,
    setActiveView,
    selectedLocation,
    selectedRadiusKm,
    setIsLocationModalOpen,
  } = useCivic();

  // Calculate real distances to all available incidents from selected location
  const incidentsWithDistance = incidents.map((inc) => {
    const dist = selectedLocation
      ? calculateDistanceKm(
          selectedLocation.lat,
          selectedLocation.lng,
          inc.location.lat,
          inc.location.lng
        )
      : undefined;
    return { ...inc, distanceKm: dist };
  }).sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

  const nearbyInRadius = selectedLocation
    ? incidentsWithDistance.filter((i) => (i.distanceKm ?? 9999) <= selectedRadiusKm)
    : incidentsWithDistance;

  const openIssuesCount = nearbyInRadius.filter((i) => i.status !== 'resolved').length;
  const totalContributorsCount = nearbyInRadius.reduce(
    (acc, i) => acc + (i.counts.uniqueContributors || 1),
    0
  );
  const isDemoArea = nearbyInRadius.length > 0 && nearbyInRadius.every((i) => i.isSample || i.location.source === 'sample');

  if (activeView === 'report_wizard') {
    return (
      <aside className="right-sidebar">
        {/* Wizard Guide Card 1 (Exact Figma PDF) */}
        <div className="widget-card">
          <div className="widget-title">A useful report starts here</div>
          <div className="widget-subtitle">
            One issue. One clear location. Original evidence from a safe distance. Your observation
            helps the community understand what needs attention.
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
              {reportDraft.location?.name || (selectedLocation ? selectedLocation.name : 'Issue location to be confirmed')}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Report ID assigned after publishing. Exact coordinates remain reviewable before you publish.
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Privacy first</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Avoid faces, vehicle plates and private interiors. Remove sensitive details from your public
              description. Keep the original evidence unchanged.
            </div>
          </div>

          <a
            href="#guidelines"
            onClick={(e) => {
              e.preventDefault();
              alert('Evidence Guidelines:\n1. Photograph only public infrastructure and clear hazards.\n2. Do not capture private residences or personal faces.\n3. Do not place yourself in physical danger.');
            }}
            className="widget-link-btn"
            style={{ marginTop: '12px' }}
          >
            <span>Read evidence guidelines</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Wizard Step 2: Manual entry note if on step 2 */}
        {wizardStep === 2 && (
          <div className="widget-card" style={{ borderLeft: '3px solid #0284c7' }}>
            <div className="widget-title" style={{ fontSize: '14px' }}>Issue location confirmation</div>
            <div style={{ fontSize: '12px', color: '#475467' }}>
              {reportDraft.location ? (
                <>
                  <span style={{ fontWeight: 600 }}>Source: {reportDraft.location.source}. </span>
                  {reportDraft.location.accuracy || 'Coordinates reviewable on map.'} Pin review is required.
                </>
              ) : (
                'Choose GPS capture, search for an address, or place a map pin.'
              )}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 600, color: '#b45309' }}>
              {reportDraft.location?.isConfirmed ? '✓ Location confirmed' : 'Location needs confirmation'}
            </div>
          </div>
        )}

        {/* Wizard Step 3 or 4: Evidence Attached Card */}
        {wizardStep >= 3 && reportDraft.evidence.length > 0 && (
          <div className="widget-card">
            <div className="widget-title">Evidence attached</div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '8px' }}>
              <img
                src={reportDraft.evidence[0].url}
                alt="Evidence"
                style={{ width: '100%', height: '140px', objectFit: 'cover' }}
              />
              <div style={{ padding: '8px', fontSize: '11px', color: '#64748b', backgroundColor: '#f8fafc' }}>
                {reportDraft.evidence[0].name} · original retained
              </div>
            </div>
          </div>
        )}

        {/* Prototype Transparency Note */}
        <div className="widget-card" style={{ backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <AlertCircle size={16} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: '#475467' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Real Geolocation Active</div>
              CivicSignal uses real browser GPS and Nominatim geocoding. Issue coordinates can be reviewed and fine-tuned before publishing.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Explore Mode Right Sidebar
  return (
    <aside className="right-sidebar">
      {/* 1. Dynamic "About Community" Widget */}
      <div className="widget-card">
        <div className="about-community-banner" />
        <div className="about-community-header">
          <div className="about-community-icon">c/</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
              c/{selectedLocation ? selectedLocation.locality : 'Local Area'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {selectedLocation
                ? `${selectedLocation.city} ${selectedLocation.state ? `· ${selectedLocation.state}` : ''}`
                : 'No location selected'}
            </div>
          </div>
        </div>

        <div className="widget-subtitle">
          "Your community. One voice. Real civic action." A resident-powered space to document, corroborate, and resolve neighborhood problems together.
        </div>

        {/* Real Area Statistics */}
        <div className="pulse-metrics">
          <div className="pulse-metric-item">
            <div className="pulse-metric-value">{totalContributorsCount}</div>
            <div className="pulse-metric-label">
              {isDemoArea ? 'sample contributors' : 'local contributors'}
            </div>
          </div>
          <div className="pulse-metric-item" style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
            <div className="pulse-metric-value" style={{ color: '#ff4500' }}>
              {openIssuesCount}
            </div>
            <div className="pulse-metric-label">open in {selectedRadiusKm}km</div>
          </div>
        </div>

        {isDemoArea && (
          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '8px' }}>
            ℹ️ Demonstration fixtures active in this area.
          </div>
        )}

        <button
          className="sidebar-report-btn"
          style={{ width: '100%', marginBottom: '8px' }}
          onClick={() => {
            setActiveView('report_wizard');
          }}
        >
          Create Civic Report
        </button>

        <button
          className="widget-link-btn"
          onClick={() => setIsLocationModalOpen(true)}
        >
          <Compass size={13} />
          <span>Switch browsing location</span>
          <span>→</span>
        </button>
      </div>

      {/* 2. Real Nearby Incidents Widget */}
      <div className="widget-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div className="widget-title" style={{ marginBottom: 0 }}>Nearby incidents</div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7' }}>
            within {selectedRadiusKm} km
          </span>
        </div>

        {nearbyInRadius.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#64748b', padding: '10px 0', lineHeight: 1.4 }}>
            No civic reports within {selectedRadiusKm} km of {selectedLocation?.locality || 'this area'}.
            {selectedLocation && selectedLocation.locality !== 'Basavanagudi' && (
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  style={{ color: '#ff4500', fontWeight: 600, fontSize: '11.5px' }}
                >
                  Switch to Basavanagudi demo area →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {nearbyInRadius.slice(0, 3).map((inc, idx) => (
              <div
                key={inc.id}
                onClick={() => {
                  setCurrentIncidentId(inc.id);
                  setActiveView('incident_detail');
                }}
                style={{
                  fontSize: '13px',
                  borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
                  paddingTop: idx > 0 ? '8px' : '0',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{inc.title}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
                  <MapPin size={11} color="#0284c7" />
                  <span>
                    {inc.distanceKm !== undefined ? formatDistance(inc.distanceKm) : 'Nearby'} · {inc.counts.witnesses} observations
                  </span>
                  {inc.isSample && (
                    <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '1px 5px', borderRadius: '4px' }}>
                      Sample
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="widget-link-btn"
          style={{ marginTop: '10px' }}
          onClick={() => {
            setActiveView('explore');
          }}
        >
          <MapPin size={13} />
          <span>View on feed radar</span>
        </button>
      </div>

      {/* 4. Trending Verified Concerns */}
      <div className="widget-card">
        <div className="widget-title">Trending verified concerns</div>
        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginBottom: '10px' }}>
          "Verified" here means recently corroborated by residents, not an official finding.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              Road safety at the college gate
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>18 still-happening confirmations</div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              Missed waste collection
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>6 recent resident observations</div>
          </div>
        </div>
      </div>

      {/* 5. Recently Resolved */}
      <div className="widget-card">
        <div className="widget-title">Recently resolved</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#15803d', fontWeight: 600, marginBottom: '4px' }}>
          <CheckCircle2 size={14} />
          <span>Resident-confirmed fix</span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
          Drain cover replaced on K.R. Road
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
          Updated 17 Oct · 3 fix photos
        </div>

        <button
          className="widget-link-btn"
          style={{ marginTop: '8px' }}
          onClick={() => alert('Displaying 42 verified community fixes in Basavanagudi this quarter.')}
        >
          <span>See resolution history</span>
          <span>→</span>
        </button>
      </div>

      {/* 6. Report With Care */}
      <div className="widget-card" style={{ backgroundColor: '#f8fafc' }}>
        <div className="widget-title" style={{ fontSize: '14px' }}>Report with care</div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '10px' }}>
          Keep original evidence. Avoid faces and private details. Confirm the location before publishing.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <a
            href="#reporting-resources"
            onClick={(e) => {
              e.preventDefault();
              alert('CivicSignal Safety Manual:\n• Stay at least 10m away from snapped wires\n• Never photograph while driving or cycling\n• Report interpersonal disputes to community mediation desk');
            }}
            className="widget-link-btn"
            style={{ fontSize: '12px' }}
          >
            <span>Reporting resources</span>
            <ExternalLink size={11} />
          </a>
          <a
            href="#safety-guidelines"
            onClick={(e) => {
              e.preventDefault();
              alert('Community Safety Guidelines:\n• Factual descriptions only\n• No personal attacks or harassment\n• Preserving evidence integrity');
            }}
            className="widget-link-btn"
            style={{ fontSize: '12px' }}
          >
            <span>Community safety guidelines</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </aside>
  );
};
