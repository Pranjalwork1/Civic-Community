import React from 'react';
import {
  MapPin,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Clock,
  Compass,
  Edit2,
  UserCheck,
  RotateCcw,
  Users,
  ChevronRight,
  Activity,
  Flame,
  Radio,
  Sparkles,
  Bot,
  ShieldAlert,
  ArrowRight,
  Check,
  Zap,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { calculateDistanceKm, formatDistance } from '../../services/locationService';

export const RightSidebar: React.FC = () => {
  const {
    activeView,
    wizardStep,
    reportDraft,
    incidents,
    rooms,
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

  const urgentHazards = incidentsWithDistance.filter(
    (i) => i.severity === 'critical' || i.categoryId === 'streetlighting_electrical'
  );

  const resolvedIncidents = incidentsWithDistance.filter((i) => i.status === 'resolved');

  if (activeView === 'report_wizard') {
    return (
      <aside className="right-sidebar" aria-label="Reporting Guidelines">
        <div className="right-sidebar-card">
          <div className="right-sidebar-card-title">Evidence & Privacy Guidelines</div>
          <p className="right-sidebar-card-desc">
            One clear civic issue per report. High-contrast photo with recognizable street context or landmark ensures fast neighborhood corroboration.
          </p>

          <div className="wizard-right-meta-row">
            <span className="wizard-right-label">Confirmed Locality:</span>
            <span className="wizard-right-val">
              {reportDraft.location?.locality || selectedLocation?.locality || 'Not specified'}
            </span>
          </div>

          <div className="wizard-right-meta-row">
            <span className="wizard-right-label">Privacy Shield:</span>
            <span className="wizard-right-val success">Active · Face blur encouraged</span>
          </div>
        </div>

        {wizardStep >= 2 && reportDraft.evidence.length > 0 && (
          <div className="right-sidebar-card">
            <div className="right-sidebar-card-title">Evidence Preview</div>
            <div className="wizard-evidence-preview-box">
              <img
                src={reportDraft.evidence[0].geotaggedUrl || reportDraft.evidence[0].url}
                alt="Draft Evidence"
                className="wizard-evidence-img"
              />
              <div className="wizard-evidence-caption">
                {reportDraft.evidence[0].name} · Geotag verified
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="right-sidebar" aria-label="Community Context and Activity">
      {/* ====================================================================
          A. CIVICSIGNAL ASSISTANT (Hero Orange Card matching Reddit Premium in ref)
          ==================================================================== */}
      <div className="sidebar-hero-assistant-card">
        <div className="hero-assistant-icon-row">
          <div className="hero-assistant-icon-box">
            <Sparkles size={20} />
          </div>
          <span className="hero-assistant-badge">AI COPILOT</span>
        </div>
        <h3 className="hero-assistant-title">CivicSignal Assistant</h3>
        <p className="hero-assistant-desc">
          Need help turning a local problem into action? Ask for hazard safety guidance, evidence tips, or petition rules.
        </p>
        <button
          type="button"
          className="hero-assistant-action-btn"
          onClick={() => setIsAiDrawerOpen(true)}
          title="Open CivicSignal AI Assistant"
        >
          <Bot size={15} />
          <span>Ask CivicSignal</span>
          <ArrowRight size={14} className="hero-btn-arrow" />
        </button>
        <div className="hero-assistant-subtext">
          <span>⚡ Localized guidance for {selectedLocation?.locality || 'your area'}</span>
        </div>
      </div>

      {/* ====================================================================
          B. YOUR COMMUNITIES (Section 9.B)
          ==================================================================== */}
      <div className="right-sidebar-card">
        <div className="right-card-header-bar">
          <span className="right-card-heading">YOUR COMMUNITIES</span>
          <button
            type="button"
            className="right-card-action-link"
            onClick={() => setIsLocationModalOpen(true)}
          >
            View All
          </button>
        </div>

        <div className="communities-compact-list">
          <div className="community-compact-row active">
            <div className="community-badge-dot bg-orange">
              {selectedLocation?.locality ? selectedLocation.locality.slice(0, 2).toUpperCase() : 'KP'}
            </div>
            <div className="community-compact-info">
              <span className="community-compact-name">
                {selectedLocation ? selectedLocation.locality : 'Knowledge Park III'}
              </span>
              <span className="community-compact-meta">42 active contributors</span>
            </div>
            <span className="community-status-live">● Active</span>
          </div>

          <div
            className="community-compact-row"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-badge-dot bg-blue">RS</div>
            <div className="community-compact-info">
              <span className="community-compact-name">Your Residential Society</span>
              <span className="community-compact-meta">88 residents · Local RWA</span>
            </div>
          </div>

          <div
            className="community-compact-row"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-badge-dot bg-green">CC</div>
            <div className="community-compact-info">
              <span className="community-compact-name">Your College Community</span>
              <span className="community-compact-meta">154 members · Campus Zone</span>
            </div>
          </div>

          <div
            className="community-compact-row"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-badge-dot bg-purple">NR</div>
            <div className="community-compact-info">
              <span className="community-compact-name">Nearby Residents</span>
              <span className="community-compact-meta">36 members · Civic Watch</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          C. NEARBY INCIDENTS (Section 9.C)
          ==================================================================== */}
      <div className="right-sidebar-card">
        <div className="right-card-header-bar">
          <span className="right-card-heading">NEARBY INCIDENTS</span>
          <span className="nearby-radius-tag">{selectedRadiusKm} km</span>
        </div>

        {nearbyUnresolved.length === 0 ? (
          <div className="nearby-empty-note">
            No unresolved incidents reported within {selectedRadiusKm} km.
          </div>
        ) : (
          <div className="nearby-compact-list">
            {nearbyUnresolved.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="nearby-compact-row"
                onClick={() => {
                  setCurrentIncidentId(inc.id);
                  setActiveView('incident_detail');
                }}
                title={inc.title}
              >
                <div className="nearby-row-left">
                  <span className="nearby-issue-title">{inc.title}</span>
                  <span className="nearby-issue-sub">
                    {inc.category} · {inc.counts.witnesses} saw it
                  </span>
                </div>
                <div className="nearby-row-right">
                  <span className="nearby-distance-tag">
                    {inc.distanceKm !== undefined ? formatDistance(inc.distanceKm) : 'Nearby'}
                  </span>
                  <span className={`nearby-status-badge ${inc.status}`}>
                    {inc.status === 'room_active' ? 'Room Open' : 'Unresolved'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================================
          D. COMMUNITY ACTIVITY (Section 9.D)
          ==================================================================== */}
      <div className="right-sidebar-card civic-activity-module">
        <div className="right-card-header-bar">
          <span className="right-card-heading">COMMUNITY ACTIVITY</span>
          <Activity size={14} color="#FF4D1A" />
        </div>

        <div className="activity-stat-rows">
          <div className="activity-stat-item">
            <span className="activity-stat-bullet orange">●</span>
            <span className="activity-stat-text">
              <strong>New photo evidence</strong> added to streetlight report
            </span>
          </div>

          <div className="activity-stat-item">
            <span className="activity-stat-bullet purple">●</span>
            <span className="activity-stat-text">
              <strong>Incident Room opened</strong> with 50 unique contributors
            </span>
          </div>

          <div className="activity-stat-item">
            <span className="activity-stat-bullet blue">●</span>
            <span className="activity-stat-text">
              <strong>Signature campaign</strong> started for road reconstruction
            </span>
          </div>

          <div className="activity-stat-item">
            <span className="activity-stat-bullet green">●</span>
            <span className="activity-stat-text">
              <strong>Leader approval</strong> granted for municipal submission
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          E. URGENT SAFETY NOTICES (Section 9.E)
          ==================================================================== */}
      {urgentHazards.length > 0 && (
        <div className="right-sidebar-card urgent-safety-card">
          <div className="urgent-card-header">
            <ShieldAlert size={16} className="urgent-shield-icon" />
            <span className="urgent-card-title">URGENT SAFETY NOTICE</span>
          </div>
          <div className="urgent-card-body">
            <p className="urgent-issue-name">{urgentHazards[0].title}</p>
            <p className="urgent-warning-text">
              ⚠️ Public electrical hazard reported near {urgentHazards[0].landmark}. Maintain at least 10m safe distance. Escalated to utility emergency team.
            </p>
            <button
              type="button"
              className="urgent-view-btn"
              onClick={() => {
                setCurrentIncidentId(urgentHazards[0].id);
                setActiveView('incident_detail');
              }}
            >
              View Hazard & Safety Guidelines →
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          F. RECENTLY RESOLVED (Section 9.F)
          ==================================================================== */}
      <div className="right-sidebar-card">
        <div className="right-card-header-bar">
          <span className="right-card-heading">RECENTLY RESOLVED</span>
          <CheckCircle2 size={14} color="#10b981" />
        </div>

        {resolvedIncidents.length === 0 ? (
          <div className="nearby-empty-note">
            No resolved issues recorded in this view yet.
          </div>
        ) : (
          <div className="resolved-compact-list">
            {resolvedIncidents.slice(0, 3).map((res) => (
              <div
                key={res.id}
                className="resolved-compact-row"
                onClick={() => {
                  setCurrentIncidentId(res.id);
                  setActiveView('incident_detail');
                }}
              >
                <div className="resolved-check-icon">
                  <Check size={12} />
                </div>
                <div className="resolved-row-info">
                  <span className="resolved-title">{res.title}</span>
                  <span className="resolved-meta">
                    Community-verified · {res.counts.witnesses} verified fix
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
