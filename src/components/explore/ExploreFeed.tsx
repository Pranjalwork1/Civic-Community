import React from 'react';
import {
  Eye,
  Users,
  Camera,
  MessageSquare,
  BookmarkCheck,
  Bookmark,
  Share2,
  Sparkles,
  ChevronDown,
  MapPin,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ISSUE_CATEGORIES } from '../../data/categories';
import { IncidentRecord } from '../../types';
import { calculateDistanceKm, formatDistance } from '../../services/locationService';

export const ExploreFeed: React.FC = () => {
  const {
    incidents,
    searchQuery,
    activeCategoryFilter,
    setActiveCategoryFilter,
    activeFeedTab,
    setActiveFeedTab,
    toggleGesture,
    setCurrentIncidentId,
    setActiveView,
    setConsolidationTargetIncident,
    setIsConsolidationModalOpen,
    resetDraft,
    setWizardStep,
    selectedLocation,
    selectedRadiusKm,
    setSelectedRadiusKm,
    setIsLocationModalOpen,
    setSelectedLocation,
  } = useCivic();

  const handleStartReport = () => {
    resetDraft();
    setWizardStep(1);
    setActiveView('report_wizard');
  };

  const handleOpenIncident = (incident: IncidentRecord) => {
    setCurrentIncidentId(incident.id);
    setActiveView('incident_detail');
  };

  const handleOpenReviewGrouping = (e: React.MouseEvent, incident: IncidentRecord) => {
    e.stopPropagation();
    setConsolidationTargetIncident(incident);
    setIsConsolidationModalOpen(true);
  };

  // Attach real geographic distances from selected browsing location
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
  });

  // Filter incidents strictly based on location radius and feed criteria
  const filteredIncidents = incidentsWithDistance.filter((inc) => {
    // Proximity / Radius filter:
    if (selectedLocation) {
      if (inc.distanceKm !== undefined && inc.distanceKm > selectedRadiusKm) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.landmark.toLowerCase().includes(q) ||
        inc.reference.toLowerCase().includes(q) ||
        inc.locality.toLowerCase().includes(q) ||
        inc.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category filter
    if (activeCategoryFilter !== 'all') {
      if (inc.categoryId !== activeCategoryFilter) return false;
    }

    // Tab filter
    if (activeFeedTab === 'unresolved') {
      return inc.status !== 'resolved';
    }
    if (activeFeedTab === 'resolved') {
      return inc.status === 'resolved';
    }
    return true;
  });

  // Sort: nearby tab sorts by distance
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (activeFeedTab === 'nearby') {
      return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
    }
    return 0;
  });

  const hasOnlyDemoRecords =
    sortedIncidents.length > 0 &&
    sortedIncidents.every((inc) => inc.isSample || inc.location.source === 'sample');

  return (
    <div className="center-content">
      {/* Explore Page Heading Box */}
      <div className="explore-header-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div className="explore-subbreadcrumb">
            {selectedLocation
              ? `c/${selectedLocation.locality.toUpperCase()} · ${selectedLocation.city.toUpperCase()}`
              : 'CHOOSE LOCATION TO EXPLORE NEARBY FEED'}
          </div>
          {hasOnlyDemoRecords && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              Demo data active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="explore-main-title">Small observations. Real civic action.</h1>
            <div className="explore-tagline">
              {selectedLocation
                ? `"Your community in ${selectedLocation.locality}. One voice. Real civic action."`
                : '"Your community. One voice. Real civic action."'}
            </div>
          </div>
          <button className="btn-primary-create" onClick={handleStartReport}>
            <PlusCircle size={16} />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Quick Create Bar */}
      <div className="reddit-create-bar" onClick={handleStartReport}>
        <div className="create-bar-avatar">CS</div>
        <div className="create-bar-input">
          {selectedLocation
            ? `What civic issue or hazard did you observe today in ${selectedLocation.locality}?`
            : 'What civic issue or hazard did you observe today?'}
        </div>
        <div className="create-bar-actions">
          <div className="create-bar-btn">
            <Camera size={15} color="#0284c7" />
            <span>Photo</span>
          </div>
          <div className="create-bar-btn">
            <MapPin size={15} color="#10b981" />
            <span>Pin Location</span>
          </div>
        </div>
      </div>

      {/* Feed Filters Tabs */}
      <div className="feed-tabs-row">
        {[
          { id: 'for_you', label: '🔥 Hot' },
          { id: 'nearby', label: '📍 Nearby' },
          { id: 'recently_updated', label: '✨ New' },
          { id: 'unresolved', label: '⚡ Urgent' },
          { id: 'resolved', label: '✅ Resolved' },
          { id: 'communities', label: '🏛️ Communities' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`feed-tab-btn ${activeFeedTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveFeedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="category-chips-row">
        <button
          className={`cat-chip ${activeCategoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategoryFilter('all')}
        >
          All Categories
        </button>
        {ISSUE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cat-chip ${activeCategoryFilter === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategoryFilter(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Feed Scope & Sort */}
      <div className="feed-scope-bar">
        <div className="scope-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={14} color="#0284c7" />
          <span>
            {selectedLocation
              ? `Around ${selectedLocation.locality} · within ${selectedRadiusKm} km`
              : 'Choose a location to filter by proximity'}
          </span>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}
          >
            Change
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Radius:</span>
          <select
            value={selectedRadiusKm}
            onChange={(e) => setSelectedRadiusKm(Number(e.target.value))}
            style={{
              padding: '2px 8px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              color: '#334155',
            }}
          >
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
          </select>
        </div>
      </div>

      {/* Incident Cards Feed or Honest Empty State */}
      {sortedIncidents.length === 0 ? (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
            color: '#64748b',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <MapPin size={26} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>
            No civic issues have been reported in this area yet.
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Be the first to report an issue in your neighborhood. Your photographic signal helps local authorities and neighbors corroborate problems early.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary-create"
              onClick={handleStartReport}
              style={{ height: '38px', padding: '0 20px' }}
            >
              <PlusCircle size={16} />
              <span>Report a Civic Issue</span>
            </button>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '38px',
                padding: '0 18px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Compass size={15} />
              <span>Change Location</span>
            </button>
          </div>

          {/* Prompt to try the demo data area if user chose another neighborhood */}
          {selectedLocation && selectedLocation.locality !== 'Basavanagudi' && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Looking for the prototype demonstration fixtures?
              </div>
              <button
                onClick={() => {
                  setSelectedLocation({
                    name: 'Basavanagudi, Bengaluru',
                    locality: 'Basavanagudi',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    lat: 12.9416,
                    lng: 77.5655,
                    accuracy: '±15m',
                    source: 'sample',
                  });
                }}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ff4500',
                  textDecoration: 'underline',
                }}
              >
                Switch browsing area to Basavanagudi (Demo Area) →
              </button>
            </div>
          )}
        </div>
      ) : (
        sortedIncidents.map((incident) => {
          const isThresholdNear = incident.counts.uniqueContributors >= 35 && incident.counts.uniqueContributors < 50;
          const isRoomActive = incident.counts.uniqueContributors >= 50 || incident.status === 'room_active';

          return (
            <article key={incident.id} className="incident-card">
              {/* Card Top Meta */}
              <div className="card-top-meta">
                <div className="reporter-info">
                  <div className="reporter-avatar-chip">{incident.reporter.avatar}</div>
                  <div className="reporter-names">
                    <div className="reporter-name-row">
                      <span className="reddit-community-tag">{incident.community}</span>
                      <span>•</span>
                      <span>Posted by u/{incident.reporter.name}</span>
                      <span className="report-time-ago">· {incident.createdAt}</span>
                    </div>
                    <div className="community-link-id">
                      Ref: {incident.reference}
                    </div>
                  </div>
                </div>

                <button
                  style={{ color: '#94a3b8', padding: '4px', borderRadius: '50%' }}
                  onClick={() => alert(`Incident Reference: ${incident.reference}\nCoordinates: ${incident.location.lat}, ${incident.location.lng}\nReporter: u/${incident.reporter.name}`)}
                >
                  •••
                </button>
              </div>

              {/* Category & Status Row */}
              <div className="card-category-status">
                <span className="category-tag">{incident.category}</span>
                {isRoomActive ? (
                  <span className="status-pill status-room-active">
                    ● Incident Room Open ({incident.counts.uniqueContributors} members)
                  </span>
                ) : incident.status === 'simulated_send_completed' ? (
                  <span className="status-pill status-submitted">
                    ✓ Simulated Send Completed
                  </span>
                ) : (
                  <span className="status-pill status-unresolved">
                    Active · Unresolved
                  </span>
                )}
                {incident.isSample && (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                    }}
                  >
                    Demo Record
                  </span>
                )}
              </div>

              {/* Title & Landmark with distance */}
              <h2 className="card-title" onClick={() => handleOpenIncident(incident)}>
                {incident.title}
              </h2>
              <div className="card-landmark">
                <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                <span>{incident.landmark}</span>
                {incident.distanceKm !== undefined && (
                  <span style={{ color: '#0284c7', fontWeight: 600, marginLeft: '6px' }}>
                    · {formatDistance(incident.distanceKm)} away
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="card-description">{incident.description}</p>

              {/* Photo Evidence Thumbnail (Exact Figma PDF) */}
              {incident.evidence.length > 0 && (
                <div
                  className="card-evidence-thumbnail"
                  onClick={() => handleOpenIncident(incident)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={incident.evidence[0].url}
                    alt={incident.title}
                    className="card-evidence-img"
                  />
                  <div className="evidence-caption">
                    Original evidence · {incident.evidence[0].contributorName} · {incident.evidence[0].timestamp}
                  </div>
                </div>
              )}

              {/* Independent Metrics Row (Exact Figma PDF) */}
              <div className="card-counters-row">
                <span>
                  <strong>{incident.counts.witnesses}</strong> witnessed
                </span>
                <span>·</span>
                <span>
                  <strong>{incident.counts.affected}</strong> affected
                </span>
                <span>·</span>
                <span>
                  <strong>{incident.counts.evidenceItems}</strong> evidence items
                </span>
              </div>

              {/* Unique Contributor Progress Bar (Threshold 50 indicator) */}
              <div className="contributor-progress-box">
                <div className="progress-header">
                  <span>
                    {isRoomActive
                      ? 'Community Room Active'
                      : incident.counts.uniqueContributors >= 40
                      ? 'Unique eligible contributors'
                      : 'Room not yet available'}
                  </span>
                  <span>
                    <strong>{incident.counts.uniqueContributors}</strong> / 50
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, (incident.counts.uniqueContributors / 50) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* AI Suggestion / Consolidation Callout (Exact Figma PDF) */}
              {incident.aiSuggestion && incident.aiSuggestion.relatedReportCount > 0 && (
                <div className="ai-suggestion-box">
                  <div className="ai-suggestion-text">
                    <Sparkles size={15} />
                    <span>
                      AI suggestion · {incident.aiSuggestion.relatedReportCount} related originals ·{' '}
                      {incident.aiSuggestion.groupingStatus === 'reviewed'
                        ? 'grouping reviewed'
                        : 'review before grouping'}
                    </span>
                  </div>
                  <button
                    className="ai-review-btn"
                    onClick={(e) => handleOpenReviewGrouping(e, incident)}
                  >
                    Review before grouping
                  </button>
                </div>
              )}

              {/* Card Actions & Civic Gestures (Reddit Style Action Pills) */}
              <div className="card-actions-row">
                <div className="gesture-buttons-group">
                  <button
                    className={`gesture-btn ${incident.userGestures.witnessed ? 'active' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'witnessed')}
                    title="Confirm you saw this civic issue"
                  >
                    <Eye size={14} />
                    <span>I Saw This</span>
                    <span style={{ fontWeight: 800 }}>({incident.counts.witnesses})</span>
                  </button>

                  <button
                    className={`gesture-btn ${incident.userGestures.affected ? 'active' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'affected')}
                    title="Record that this issue impacts your daily commute or residence"
                  >
                    <Users size={14} />
                    <span>I'm Affected</span>
                    <span style={{ fontWeight: 800 }}>({incident.counts.affected})</span>
                  </button>

                  <button
                    className="gesture-btn"
                    onClick={() => handleOpenIncident(incident)}
                    title="Contribute photographic or video evidence"
                  >
                    <Camera size={14} />
                    <span>Add Evidence</span>
                  </button>
                </div>

                <div className="card-footer-meta">
                  <span
                    className="gesture-btn"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOpenIncident(incident)}
                    title="Open discussions"
                  >
                    <MessageSquare size={14} />
                    <span>{incident.counts.discussions}</span>
                  </span>

                  <span
                    className={`btn-follow ${incident.userGestures.followed ? 'active' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'followed')}
                  >
                    {incident.userGestures.followed ? '✓ Following' : '+ Follow'}
                  </span>
                </div>
              </div>
            </article>
          );
        })
      )}

      {/* Footer Informational Disclaimer (Exact Figma PDF) */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b',
          padding: '24px 0',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        You're up to date in {selectedLocation?.locality || 'your area'}. A witness signal is an observation, not proof of validity or resolution.
      </div>
    </div>
  );
};
