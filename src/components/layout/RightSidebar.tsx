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
    setCurrentIncidentId,
    setActiveView,
    selectedLocation,
    selectedRadiusKm,
    setIsLocationModalOpen,
    currentUser,
    setCurrentUser,
    resetAllDemoData,
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

  const nearbyInRadius = selectedLocation
    ? incidentsWithDistance.filter((i) => (i.distanceKm ?? 9999) <= selectedRadiusKm)
    : incidentsWithDistance;

  const openIssuesCount = nearbyInRadius.filter((i) => i.status !== 'resolved').length;
  const totalContributorsCount = nearbyInRadius.reduce(
    (acc, i) => acc + (i.counts.uniqueContributors || 1),
    0
  );
  const isDemoArea =
    nearbyInRadius.length > 0 &&
    nearbyInRadius.every((i) => i.isSample || i.location.source === 'sample');

  if (activeView === 'report_wizard') {
    return (
      <aside className="right-sidebar">
        {/* Wizard Guide Card 1 */}
        <div className="right-card-box">
          <div className="right-card-title">A useful report starts here</div>
          <div className="right-card-desc">
            One issue. One clear location. Original evidence from a safe distance. Your observation
            helps the community understand what needs attention.
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
              {reportDraft.location?.name ||
                (selectedLocation ? selectedLocation.name : 'Issue location to be confirmed')}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              Exact coordinates remain reviewable before you publish.
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Privacy first</div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              Avoid faces, vehicle plates and private interiors. Keep the original evidence unchanged.
            </div>
          </div>
        </div>

        {/* Wizard Step 2: Manual entry note if on step 2 */}
        {wizardStep === 2 && (
          <div className="right-card-box" style={{ borderLeft: '3px solid #0284c7' }}>
            <div className="right-card-title" style={{ fontSize: '13.5px' }}>Location Review</div>
            <div style={{ fontSize: '11.5px', color: '#475467', lineHeight: 1.4 }}>
              {reportDraft.location ? (
                <>
                  <span style={{ fontWeight: 600 }}>Source: {reportDraft.location.source}. </span>
                  {reportDraft.location.accuracy || 'Coordinates reviewable on map.'} Pin review is required.
                </>
              ) : (
                'Choose GPS capture, search for an address, or place a map pin.'
              )}
            </div>
          </div>
        )}

        {/* Wizard Step 3 or 4: Evidence Attached Card */}
        {wizardStep >= 3 && reportDraft.evidence.length > 0 && (
          <div className="right-card-box">
            <div className="right-card-title">Evidence attached</div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '8px' }}>
              <img
                src={reportDraft.evidence[0].geotaggedUrl || reportDraft.evidence[0].url}
                alt="Evidence"
                style={{ width: '100%', height: '130px', objectFit: 'cover' }}
              />
              <div style={{ padding: '6px 8px', fontSize: '11px', color: '#64748b', backgroundColor: '#f8fafc' }}>
                {reportDraft.evidence[0].name} · original retained
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // Explore Mode Right Sidebar
  return (
    <aside className="right-sidebar">
      {/* 1. User Profile Card (Directly inspired by Reference Image profile card!) */}
      <div className="profile-hero-card">
        <div className="profile-avatar-circle">
          <span className="profile-avatar-text">{currentUser.avatar}</span>
        </div>
        <h3 className="profile-user-name">{currentUser.name}</h3>
        <div className="profile-role-badge">
          {currentUser.role === 'community_leader'
            ? 'Community Leader'
            : currentUser.role === 'active_witness'
            ? 'Active Witness'
            : 'Verified Resident'}
        </div>

        {/* Quick action buttons (Edit, Switch, Reset) */}
        <div className="profile-actions-row">
          <button
            className="profile-action-btn"
            title="Switch demo persona"
            onClick={() => {
              const currentIndex = DEMO_USERS.findIndex((u) => u.id === currentUser.id);
              const nextUser = DEMO_USERS[(currentIndex + 1) % DEMO_USERS.length];
              setCurrentUser(nextUser);
            }}
          >
            <UserCheck size={14} />
          </button>
          <button
            className="profile-action-btn"
            title="Change browsing location"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <Compass size={14} />
          </button>
          <button
            className="profile-action-btn"
            title="Reset demo data"
            onClick={() => resetAllDemoData()}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* 2. Your Communities Panel (Directly inspired by Reference Image "Your Communities") */}
      <div className="right-card-box">
        <div className="right-card-header-row">
          <h4 className="right-card-title">Your Communities</h4>
          <button
            className="right-card-link-btn"
            onClick={() => setIsLocationModalOpen(true)}
          >
            View all
          </button>
        </div>

        <div className="communities-list">
          <div className="community-list-item active">
            <div className="community-icon-circle bg-orange">BG</div>
            <div className="community-info">
              <div className="community-title">c/Basavanagudi</div>
              <div className="community-sub">Active community · 42 contributors</div>
            </div>
          </div>

          <div
            className="community-list-item"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-icon-circle bg-blue">KM</div>
            <div className="community-info">
              <div className="community-title">c/Koramangala</div>
              <div className="community-sub">28 open signals · Bengaluru</div>
            </div>
          </div>

          <div
            className="community-list-item"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="community-icon-circle bg-green">IN</div>
            <div className="community-info">
              <div className="community-title">c/Indiranagar</div>
              <div className="community-sub">19 open signals · Bengaluru</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Nearby Incidents Widget */}
      <div className="right-card-box">
        <div className="right-card-header-row">
          <h4 className="right-card-title">Nearby Incidents</h4>
          <span className="right-radius-indicator">
            {selectedRadiusKm} km
          </span>
        </div>

        {nearbyInRadius.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#64748b', padding: '8px 0', lineHeight: 1.4 }}>
            No civic reports within {selectedRadiusKm} km of {selectedLocation?.locality || 'this area'}.
          </div>
        ) : (
          <div className="nearby-incidents-mini-list">
            {nearbyInRadius.slice(0, 3).map((inc) => (
              <div
                key={inc.id}
                className="nearby-incident-item"
                onClick={() => {
                  setCurrentIncidentId(inc.id);
                  setActiveView('incident_detail');
                }}
              >
                <div className="nearby-item-title">{inc.title}</div>
                <div className="nearby-item-meta">
                  <MapPin size={11} color="#0284c7" />
                  <span>
                    {inc.distanceKm !== undefined ? formatDistance(inc.distanceKm) : 'Nearby'} · {inc.counts.witnesses} saw it
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Recently Resolved (Inspires community confidence) */}
      <div className="right-card-box">
        <div className="right-card-header-row">
          <h4 className="right-card-title">Recently Resolved</h4>
          <CheckCircle2 size={14} color="#16a34a" />
        </div>

        <div className="resolved-item">
          <div className="resolved-item-title">Drain cover replaced on K.R. Road</div>
          <div className="resolved-item-meta">
            Verified by 12 neighbors · Resolution Confirmed
          </div>
        </div>
      </div>

      {/* 5. Community Safety Guidelines */}
      <div className="right-card-box subtle-bg">
        <div className="right-card-title" style={{ fontSize: '13px' }}>Report with care</div>
        <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4, marginBottom: '8px' }}>
          Capture clear evidence from a safe distance. Never approach active electrical hazards.
        </div>
        <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
          CivicSignal Safety Charter →
        </div>
      </div>
    </aside>
  );
};
