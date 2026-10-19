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
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { calculateDistanceKm, formatDistance } from '../../services/locationService';
import { DEMO_USERS } from '../../data/mockData';

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
    currentUser,
    setCurrentUser,
    resetAllDemoData,
  } = useCivic();

  // Calculate distances to all available incidents from selected location
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

  const nearbyInRadius = selectedLocation
    ? incidentsWithDistance.filter((i) => (i.distanceKm ?? 9999) <= selectedRadiusKm)
    : incidentsWithDistance;

  const activeRoomsCount = rooms.length;

  if (activeView === 'report_wizard') {
    return (
      <aside className="right-sidebar">
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

  // Explore Mode Right Sidebar per Section 14
  return (
    <aside className="right-sidebar" aria-label="Community Profile and Activity">
      {/* 1. USER PROFILE (Section 14) */}
      <div className="right-sidebar-card profile-card-module">
        <div className="profile-card-top">
          <div className="profile-card-avatar">{currentUser.avatar}</div>
          <div className="profile-card-text">
            <h3 className="profile-card-name">{currentUser.name}</h3>
            <span className="profile-card-role-pill">
              {currentUser.role === 'community_leader'
                ? 'Community Leader'
                : 'Verified Resident'}
            </span>
          </div>
        </div>

        <button
          className="profile-card-view-btn"
          onClick={() => {
            const nextUser = DEMO_USERS.find((u) => u.id !== currentUser.id) || DEMO_USERS[0];
            setCurrentUser(nextUser);
          }}
          title="Switch resident / leader persona"
        >
          <UserCheck size={14} />
          <span>Switch Persona (Current: {currentUser.name.split(' ')[0]})</span>
        </button>
      </div>

      {/* 2. YOUR COMMUNITIES (Section 14) */}
      <div className="right-sidebar-card">
        <div className="right-card-header-bar">
          <span className="right-card-heading">YOUR COMMUNITIES</span>
          <button
            className="right-card-view-all-link"
            onClick={() => setIsLocationModalOpen(true)}
          >
            Change
          </button>
        </div>

        <div className="communities-compact-list">
          <div className="community-compact-row active">
            <div className="community-badge-dot bg-orange">KP</div>
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
            <div className="community-badge-dot bg-blue">BS</div>
            <div className="community-compact-info">
              <span className="community-compact-name">Basavanagudi</span>
              <span className="community-compact-meta">28 contributors · Bengaluru</span>
            </div>
          </div>

          <div
            className="community-compact-row"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-badge-dot bg-green">KM</div>
            <div className="community-compact-info">
              <span className="community-compact-name">Koramangala</span>
              <span className="community-compact-meta">19 contributors · Bengaluru</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NEARBY INCIDENTS (Section 14) */}
      <div className="right-sidebar-card">
        <div className="right-card-header-bar">
          <span className="right-card-heading">NEARBY INCIDENTS</span>
          <span className="nearby-radius-tag">{selectedRadiusKm} km</span>
        </div>

        {nearbyInRadius.length === 0 ? (
          <div className="nearby-empty-note">
            No incidents reported within {selectedRadiusKm} km.
          </div>
        ) : (
          <div className="nearby-compact-list">
            {nearbyInRadius.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="nearby-compact-row"
                onClick={() => {
                  setCurrentIncidentId(inc.id);
                  setActiveView('incident_detail');
                }}
              >
                <div className="nearby-row-left">
                  <span className="nearby-issue-title">{inc.title}</span>
                  <span className="nearby-issue-sub">
                    {inc.category} · {inc.counts.witnesses} saw it
                  </span>
                </div>
                <span className="nearby-distance-tag">
                  {inc.distanceKm !== undefined ? formatDistance(inc.distanceKm) : 'Nearby'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. CIVIC ACTIVITY (Section 14) */}
      <div className="right-sidebar-card civic-activity-module">
        <div className="right-card-header-bar">
          <span className="right-card-heading">CIVIC ACTIVITY</span>
          <Activity size={14} color="#FF4D1A" />
        </div>

        <div className="activity-stat-rows">
          <div className="activity-stat-item">
            <span className="activity-stat-bullet">●</span>
            <span className="activity-stat-text">
              <strong>{nearbyInRadius.length}</strong> incidents near your selected area
            </span>
          </div>

          <div className="activity-stat-item">
            <span className="activity-stat-bullet amber">●</span>
            <span className="activity-stat-text">
              <strong>{incidents.filter((i) => i.counts.uniqueContributors < 50).length}</strong> reports gathering resident verification
            </span>
          </div>

          <div className="activity-stat-item">
            <span className="activity-stat-bullet purple">●</span>
            <span className="activity-stat-text">
              <strong>{activeRoomsCount || 1}</strong> community incident room active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
