import React from 'react';
import {
  Sparkles,
  MapPin,
  ChevronRight,
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
    setIsAiDrawerOpen,
  } = useCivic();

  // Calculate real distances to all available incidents from selected location
  const incidentsWithDistance = incidents
    .map((inc) => {
      const dist = selectedLocation
        ? calculateDistanceKm(
            selectedLocation.lat,
            selectedLocation.lng,
            inc.location.lat,
            inc.location.lng
          )
        : undefined;
      return { ...inc, distanceKm: dist };
    })
    .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

  const nearbyUnresolved = selectedLocation
    ? incidentsWithDistance.filter(
        (i) => (i.distanceKm ?? 9999) <= selectedRadiusKm && i.status !== 'resolved'
      )
    : incidentsWithDistance.filter((i) => i.status !== 'resolved');

  const localityName = selectedLocation?.locality || 'Knowledge Park III';

  if (activeView === 'report_wizard') {
    return (
      <aside className="right-sidebar-container" aria-label="Reporting Guidelines">
        <div className="right-sidebar-card">
          <h3 className="right-card-heading">EVIDENCE &amp; PRIVACY</h3>
          <p className="right-card-text" style={{ marginTop: '8px' }}>
            One clear civic issue per report. High-contrast photo with recognizable street context or landmark ensures fast neighborhood corroboration.
          </p>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#5C554F' }}>Confirmed Locality:</span>
              <span style={{ fontWeight: 700, color: '#1B1A19' }}>
                {reportDraft.location?.locality || localityName}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#5C554F' }}>Privacy Shield:</span>
              <span style={{ fontWeight: 700, color: '#0F6B3A' }}>Active · Face blur encouraged</span>
            </div>
          </div>
        </div>

        {wizardStep >= 2 && reportDraft.evidence.length > 0 && (
          <div className="right-sidebar-card">
            <h3 className="right-card-heading">EVIDENCE PREVIEW</h3>
            <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
              <img
                src={reportDraft.evidence[0].geotaggedUrl || reportDraft.evidence[0].url}
                alt="Draft Evidence"
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{ fontSize: '12px', color: '#5C554F', marginTop: '6px' }}>
                {reportDraft.evidence[0].name} · Geotag verified
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="right-sidebar-container" aria-label="Assistant and Community Details">
      {/* 1. AI Assistant Card */}
      <section className="ai-assistant-card" aria-label="CivicSignal Assistant">
        <div className="ai-card-top-row">
          <div className="ai-icon-tile" aria-hidden="true">
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <span className="ai-copilot-pill">AI COPILOT</span>
        </div>

        <h2 className="ai-card-title">CivicSignal Assistant</h2>
        <p className="ai-card-desc">
          Ask for hazard safety guidance, evidence tips or petition rules, tailored to {localityName}.
        </p>

        <button
          type="button"
          className="ai-card-btn"
          onClick={() => setIsAiDrawerOpen(true)}
          aria-label="Ask CivicSignal Assistant"
        >
          Ask CivicSignal
        </button>
      </section>

      {/* 2. YOUR COMMUNITIES Card */}
      <section className="right-sidebar-card" aria-label="Your Communities">
        <div className="right-card-header">
          <h2 className="right-card-heading">YOUR COMMUNITIES</h2>
          <button
            type="button"
            className="right-card-link-btn"
            onClick={() => setIsLocationModalOpen(true)}
            aria-label="View all communities"
          >
            View all
          </button>
        </div>

        <div className="communities-list" role="list">
          {/* Row 1: Active Community (Knowledge Park III) */}
          <div
            className="community-row active-community"
            role="listitem"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-avatar-tile avatar-orange" aria-hidden="true">
              KN
            </div>
            <div className="community-meta-col">
              <span className="community-name">{localityName}</span>
              <span className="community-subtext">42 active contributors</span>
            </div>
            <span className="community-status-badge">Active</span>
          </div>

          {/* Row 2: Your Residential Society */}
          <div
            className="community-row"
            role="listitem"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-avatar-tile avatar-blue" aria-hidden="true">
              RS
            </div>
            <div className="community-meta-col">
              <span className="community-name">Your Residential Society</span>
              <span className="community-subtext">88 residents · Local RWA</span>
            </div>
          </div>

          {/* Row 3: Your College Community */}
          <div
            className="community-row"
            role="listitem"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-avatar-tile avatar-green" aria-hidden="true">
              CC
            </div>
            <div className="community-meta-col">
              <span className="community-name">Your College Community</span>
              <span className="community-subtext">154 members · Campus Zone</span>
            </div>
          </div>

          {/* Row 4: Nearby Residents */}
          <div
            className="community-row"
            role="listitem"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-avatar-tile avatar-purple" aria-hidden="true">
              NR
            </div>
            <div className="community-meta-col">
              <span className="community-name">Nearby Residents</span>
              <span className="community-subtext">36 members · Civic Watch</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEARBY INCIDENTS Card */}
      <section className="right-sidebar-card" aria-label="Nearby Incidents">
        <div className="right-card-header">
          <h2 className="right-card-heading">NEARBY INCIDENTS</h2>
          <span className="nearby-radius-pill">{selectedRadiusKm} km</span>
        </div>

        {nearbyUnresolved.length === 0 ? (
          <p className="nearby-empty-text">
            No unresolved incidents within {selectedRadiusKm} km. Nice work, neighbours.
          </p>
        ) : (
          <div className="nearby-incident-list" role="list">
            {nearbyUnresolved.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="nearby-incident-row"
                role="listitem"
                onClick={() => {
                  setCurrentIncidentId(inc.id);
                  setActiveView('incident_detail');
                }}
              >
                <div className="nearby-incident-info">
                  <span className="nearby-incident-title">{inc.title}</span>
                  <span className="nearby-incident-sub">
                    {inc.category} · {inc.counts.witnesses} saw it
                  </span>
                </div>
                <div className="nearby-incident-meta">
                  <span className="nearby-distance-badge">
                    {inc.distanceKm !== undefined ? formatDistance(inc.distanceKm) : 'Nearby'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
};
