import React from 'react';
import {
  Eye,
  EyeOff,
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
  ArrowRight,
  ShieldAlert,
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
      {/* Community Hero Header (inspired by reference image top topic section) */}
      <div className="community-hero-header">
        <div className="hero-header-top">
          <div>
            <div className="hero-topic-subtitle">Community Workspace</div>
            <h1 className="hero-topic-title">
              {selectedLocation ? selectedLocation.locality : 'Civic Community Feed'}
            </h1>
          </div>

          <div className="hero-avatar-stack-wrap">
            <div className="avatar-stack">
              <div className="stack-avatar a1" title="Aditi Sharma (Leader)">AS</div>
              <div className="stack-avatar a2" title="Rahul Mehta">RM</div>
              <div className="stack-avatar a3" title="Kavita Iyer">KI</div>
              <div className="stack-avatar-count" title="Active neighborhood contributors">
                +{incidents.reduce((acc, curr) => acc + curr.counts.witnesses, 0) || 28}
              </div>
            </div>
            <button
              className="hero-report-btn"
              onClick={handleStartReport}
              title="Report a civic issue"
            >
              <PlusCircle size={15} />
              <span>Create Report</span>
            </button>
          </div>
        </div>

        <div className="hero-tagline-bar">
          <p className="hero-tagline-text">
            {selectedLocation
              ? `Your community in ${selectedLocation.locality}, ${selectedLocation.city}. One voice. Real civic action.`
              : 'Your community. One voice. Real civic action.'}
          </p>
          {hasOnlyDemoRecords && (
            <span className="demo-badge-pill">
              Prototype Demonstration Data
            </span>
          )}
        </div>

        {/* Tab Pills & Pagination Controls (Matching reference image) */}
        <div className="hero-nav-tabs-row">
          <div className="hero-tab-pills">
            {[
              { id: 'for_you', label: 'For You' },
              { id: 'nearby', label: 'Nearby' },
              { id: 'unresolved', label: 'Unresolved' },
              { id: 'recently_updated', label: 'Recently Updated' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'communities', label: 'Communities' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`hero-tab-pill ${activeFeedTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFeedTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hero-pager-arrows">
            <button
              className="pager-arrow-btn"
              onClick={() => {
                const tabs = ['for_you', 'nearby', 'unresolved', 'recently_updated', 'resolved', 'communities'];
                const idx = tabs.indexOf(activeFeedTab);
                if (idx > 0) setActiveFeedTab(tabs[idx - 1]);
              }}
              title="Previous Feed"
            >
              ←
            </button>
            <button
              className="pager-arrow-btn"
              onClick={() => {
                const tabs = ['for_you', 'nearby', 'unresolved', 'recently_updated', 'resolved', 'communities'];
                const idx = tabs.indexOf(activeFeedTab);
                if (idx < tabs.length - 1) setActiveFeedTab(tabs[idx + 1]);
              }}
              title="Next Feed"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Featured Civic Highlight Banner (Matching panoramic hero card from reference image) */}
      {sortedIncidents.length > 0 && activeFeedTab === 'for_you' && (
        <div
          className="featured-incident-banner"
          onClick={() => handleOpenIncident(sortedIncidents[0])}
        >
          <div className="featured-banner-image-wrap">
            <img
              src={sortedIncidents[0].evidence[0]?.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80'}
              alt={sortedIncidents[0].title}
              className="featured-banner-img"
            />
            <div className="featured-banner-overlay" />
            <div className="featured-banner-top-badges">
              <span className="featured-tag">
                {sortedIncidents[0].severity === 'high' ? '⚠️ Urgent Community Signal' : '🔥 Top Corroborated Issue'}
              </span>
              <span className="featured-category-badge">
                {sortedIncidents[0].category}
              </span>
            </div>
            <div className="featured-banner-meta-bottom">
              <h3 className="featured-banner-title">{sortedIncidents[0].title}</h3>
              <p className="featured-banner-sub">
                {sortedIncidents[0].landmark} · {sortedIncidents[0].counts.witnesses} residents corroborated · {sortedIncidents[0].counts.discussions} comments
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Civic Observation Composer Bar */}
      <div className="reddit-create-bar" onClick={handleStartReport}>
        <div className="create-bar-avatar">CS</div>
        <div className="create-bar-input">
          {selectedLocation
            ? `Report an issue or hazard in ${selectedLocation.locality} (pothole, streetlight, wires, drainage)...`
            : 'Report an issue or hazard (pothole, streetlight, wires, drainage)...'}
        </div>
        <div className="create-bar-actions">
          <div className="create-bar-btn">
            <Camera size={15} color="#FF4D1A" />
            <span>Camera</span>
          </div>
          <div className="create-bar-btn">
            <MapPin size={15} color="#2878D0" />
            <span>Geotag Pin</span>
          </div>
        </div>
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

      {/* Feed Scope & Radius Filter */}
      <div className="feed-scope-bar">
        <div className="scope-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={14} color="#2878D0" />
          <span>
            {selectedLocation
              ? `Showing issues within ${selectedRadiusKm} km of ${selectedLocation.locality}`
              : 'Choose a location to filter by proximity'}
          </span>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            style={{ fontSize: '11px', color: '#2878D0', fontWeight: 600, textDecoration: 'underline' }}
          >
            Change
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Search Radius:</span>
          <select
            value={selectedRadiusKm}
            onChange={(e) => setSelectedRadiusKm(Number(e.target.value))}
            style={{
              padding: '3px 8px',
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

      {/* Incident Feed Items */}
      {sortedIncidents.length === 0 ? (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '48px 32px',
            textAlign: 'center',
            color: '#64748b',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#2878D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <MapPin size={28} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '19px', color: '#0f172a', marginBottom: '8px' }}>
            No civic issues reported in this immediate area yet
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Be the first resident to report an issue in your neighborhood. Your photographic signal helps local authorities and neighbors corroborate problems early.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary-create"
              onClick={handleStartReport}
              style={{ height: '40px', padding: '0 22px' }}
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
                height: '40px',
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
                  color: '#FF4D1A',
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
          const isRoomActive = incident.counts.uniqueContributors >= 50 || incident.status === 'room_active';
          const isUrgentHazard = incident.severity === 'high' || incident.categoryId === 'electricity_lighting';

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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isUrgentHazard && (
                    <span className="urgent-hazard-badge">
                      <ShieldAlert size={12} />
                      <span>Urgent Hazard</span>
                    </span>
                  )}
                  <button
                    style={{ color: '#94a3b8', padding: '4px', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => alert(`Incident Reference: ${incident.reference}\nCoordinates: ${incident.location.lat}, ${incident.location.lng}\nReporter: u/${incident.reporter.name}`)}
                  >
                    •••
                  </button>
                </div>
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
                <MapPin size={13} className="landmark-pin-icon" />
                <span>{incident.landmark}</span>
                {incident.distanceKm !== undefined && (
                  <span className="landmark-distance-pill">
                    · {formatDistance(incident.distanceKm)} away
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="card-description">{incident.description}</p>

              {/* Photo Evidence Preview */}
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
                    Evidence · {incident.evidence[0].contributorName} · {incident.evidence[0].timestamp}
                  </div>
                </div>
              )}

              {/* Independent Metrics Row */}
              <div className="card-counters-row">
                <span>
                  <strong>{incident.counts.witnesses}</strong> saw it
                </span>
                <span className="counter-dot-sep">·</span>
                <span>
                  <strong>{incident.counts.didNotSeeCount ?? 0}</strong> didn't see
                </span>
                <span className="counter-dot-sep">·</span>
                <span>
                  <strong>{incident.counts.affected}</strong> affected
                </span>
                <span className="counter-dot-sep">·</span>
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
                      : 'Room threshold progress'}
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

              {/* AI Suggestion / Consolidation Callout */}
              {incident.aiSuggestion && incident.aiSuggestion.relatedReportCount > 0 && (
                <div className="ai-suggestion-box">
                  <div className="ai-suggestion-text">
                    <Sparkles size={15} />
                    <span>
                      AI suggestion · {incident.aiSuggestion.relatedReportCount} related candidate reports ·{' '}
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

              {/* Card Actions & Mutually Exclusive Observation Selector */}
              <div className="card-actions-row">
                {/* Section 7: Mutually Exclusive Observation Selector */}
                <div className="observation-segmented-control" role="group" aria-label="Incident observation selector">
                  <button
                    type="button"
                    className={`obs-btn obs-saw-it ${incident.userGestures.witnessed ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGesture(incident.id, 'witnessed');
                    }}
                    title="Confirm you saw this civic issue"
                  >
                    <Eye size={14} />
                    <span>I Saw It</span>
                    <span className="obs-counter">{incident.counts.witnesses}</span>
                  </button>

                  <button
                    type="button"
                    className={`obs-btn obs-did-not-see ${incident.userGestures.didNotSee ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGesture(incident.id, 'didNotSee');
                    }}
                    title="Report that you did not see this issue"
                  >
                    <EyeOff size={14} />
                    <span>I Didn't See It</span>
                    <span className="obs-counter">{incident.counts.didNotSeeCount ?? 0}</span>
                  </button>
                </div>

                {/* Secondary Action Controls */}
                <div className="card-secondary-actions">
                  <button
                    className={`action-pill-btn ${incident.userGestures.affected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGesture(incident.id, 'affected');
                    }}
                    title="Record that this issue affects you"
                  >
                    <Users size={14} />
                    <span>Affected ({incident.counts.affected})</span>
                  </button>

                  <button
                    className="action-pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIncident(incident);
                    }}
                    title="View and contribute evidence"
                  >
                    <Camera size={14} />
                    <span>Evidence ({incident.counts.evidenceItems})</span>
                  </button>

                  <button
                    className="action-pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIncident(incident);
                    }}
                    title="Open discussions"
                  >
                    <MessageSquare size={14} />
                    <span>{incident.counts.discussions}</span>
                  </button>

                  <button
                    className={`btn-follow ${incident.userGestures.followed ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGesture(incident.id, 'followed');
                    }}
                  >
                    {incident.userGestures.followed ? '✓ Following' : '+ Follow'}
                  </button>
                </div>
              </div>
            </article>
          );
        })
      )}

      {/* Footer Informational Disclaimer */}
      <div className="feed-footer-disclaimer">
        You're up to date in {selectedLocation?.locality || 'your area'}. A witness signal is an observation, not official proof of validity or government resolution.
      </div>
    </div>
  );
};
