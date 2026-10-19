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
  Flame,
  Radio,
  Map,
  CheckCircle2,
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

  const totalContributorsInLocality = incidents.reduce(
    (acc, curr) => acc + curr.counts.witnesses + curr.counts.affected,
    0
  );
  const openCount = incidents.filter((i) => i.status !== 'resolved').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <div className="center-content" role="region" aria-label="Community Feed">
      {/* 1. COMPACT COMMUNITY HEADER (Section 6) */}
      <section className="compact-community-header" aria-label="Community Overview">
        <div className="community-header-main-row">
          <div className="community-header-text">
            <span className="community-pre-label">COMMUNITY WORKSPACE</span>
            <h1 className="community-locality-title">
              {selectedLocation ? selectedLocation.locality : 'Knowledge Park III'}
            </h1>
            <div className="community-city-sub">
              {selectedLocation ? selectedLocation.city : 'Greater Noida'}
            </div>
            <p className="community-tagline">
              "Your community. One voice. Real civic action."
            </p>
          </div>

          <div className="community-header-right-action">
            <div className="community-avatar-pile">
              <span className="pile-avatar c1">AS</span>
              <span className="pile-avatar c2">RM</span>
              <span className="pile-avatar c3">KI</span>
              <span className="pile-counter">+{totalContributorsInLocality || 42}</span>
            </div>
            <button className="btn-community-create-report" onClick={handleStartReport}>
              <PlusCircle size={15} />
              <span>Create Report</span>
            </button>
          </div>
        </div>

        {/* Community Vital Metrics Pills (Section 6) */}
        <div className="community-vitals-row">
          <span className="vital-chip">
            <strong>{totalContributorsInLocality || 42}</strong> active contributors
          </span>
          <span className="vital-chip">
            <strong>{openCount}</strong> open incidents
          </span>
          <span className="vital-chip success">
            <strong>{resolvedCount || 7}</strong> resolved
          </span>
        </div>

        {/* Feed Filter Navigation Tabs (Section 6) */}
        <div className="community-nav-tabs">
          {[
            { id: 'for_you', label: 'For You' },
            { id: 'nearby', label: 'Nearby' },
            { id: 'unresolved', label: 'Unresolved' },
            { id: 'recently_updated', label: 'Recently Updated' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`community-tab-link ${activeFeedTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveFeedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. REPORT CREATION COMPOSER BAR (Section 7) */}
      <section className="prominent-report-composer" onClick={handleStartReport}>
        <div className="composer-prompt-row">
          <div className="composer-avatar-chip">CS</div>
          <div className="composer-prompt-text">
            What civic issue or hazard did you notice in {selectedLocation?.locality || 'your community'}?
          </div>
        </div>

        <div className="composer-actions-row">
          <button
            type="button"
            className="composer-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleStartReport();
            }}
          >
            <Camera size={15} color="#FF4D1A" />
            <span>Camera</span>
          </button>

          <button
            type="button"
            className="composer-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleStartReport();
            }}
          >
            <MapPin size={15} color="#2878D0" />
            <span>Use Current Location</span>
          </button>

          <button
            type="button"
            className="composer-submit-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleStartReport();
            }}
          >
            + Create
          </button>
        </div>
      </section>

      {/* 3. ISSUE CATEGORY PILLS (Section 8: Horizontally Scrollable) */}
      <div className="categories-scroll-wrapper">
        <div className="categories-scroll-track">
          <button
            className={`category-pill-btn ${activeCategoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategoryFilter('all')}
          >
            All
          </button>
          {ISSUE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill-btn ${activeCategoryFilter === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategoryFilter(cat.id)}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. LOCATION CONTEXT BAR (Section 9) */}
      <div className="location-context-bar">
        <div className="context-left">
          <MapPin size={14} color="#2878D0" />
          <span className="context-label">
            Showing civic issues within <strong>{selectedRadiusKm} km</strong> of{' '}
            {selectedLocation ? selectedLocation.locality : 'Knowledge Park III'}
          </span>
          <button
            className="context-change-link"
            onClick={() => setIsLocationModalOpen(true)}
          >
            [Change location]
          </button>
        </div>

        <div className="context-right">
          <select
            value={selectedRadiusKm}
            onChange={(e) => setSelectedRadiusKm(Number(e.target.value))}
            className="context-radius-select"
            aria-label="Filter Radius"
          >
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
          </select>

          <button
            className="context-map-btn"
            onClick={() => {
              setActiveFeedTab('nearby');
            }}
            title="Sort by proximity"
          >
            <Map size={13} />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* 5. INCIDENT FEED CARDS OR COMPACT EMPTY STATE (Section 10 & 15) */}
      {sortedIncidents.length === 0 ? (
        <div className="compact-empty-state">
          <div className="empty-state-icon-circle">
            <MapPin size={24} />
          </div>
          <h3 className="empty-state-title">No civic issues reported nearby</h3>
          <p className="empty-state-sub">
            Be the first person to report a problem in your community.
          </p>
          <div className="empty-state-btn-row">
            <button className="btn-empty-report" onClick={handleStartReport}>
              <PlusCircle size={15} />
              <span>Report a Civic Issue</span>
            </button>
            <button
              className="btn-empty-radar"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <Compass size={15} />
              <span>Explore Nearby Radar</span>
            </button>
          </div>
        </div>
      ) : (
        sortedIncidents.map((incident) => {
          const isRoomActive =
            incident.counts.uniqueContributors >= 50 || incident.status === 'room_active';
          const isUrgentHazard =
            incident.severity === 'high' || incident.categoryId === 'electricity_lighting';

          return (
            <article key={incident.id} className="civic-feed-card">
              {/* Card Header: Author, Locality, Time, Ref */}
              <div className="feed-card-header">
                <div className="feed-card-author-left">
                  <div className="author-avatar-chip">{incident.reporter.avatar}</div>
                  <div className="author-meta-block">
                    <div className="author-name-line">
                      <span className="author-name">{incident.reporter.name}</span>
                      <span className="meta-sep">•</span>
                      <span className="author-time">{incident.createdAt}</span>
                    </div>
                    <div className="author-location-line">
                      <MapPin size={11} color="#2878D0" />
                      <span>{incident.locality}</span>
                      <span className="meta-sep">•</span>
                      <span className="incident-ref-id">Ref: {incident.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="feed-card-header-right">
                  {isUrgentHazard && (
                    <span className="urgent-hazard-tag">
                      <ShieldAlert size={12} />
                      <span>Safety Hazard</span>
                    </span>
                  )}
                  <span className="category-badge-chip">{incident.category}</span>
                </div>
              </div>

              {/* Title & Landmark */}
              <h2 className="feed-card-title" onClick={() => handleOpenIncident(incident)}>
                {incident.title}
              </h2>
              <div className="feed-card-landmark-row">
                <MapPin size={13} className="landmark-icon" />
                <span>{incident.landmark}</span>
                {incident.distanceKm !== undefined && (
                  <span className="landmark-distance-away">
                    · {formatDistance(incident.distanceKm)} away
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="feed-card-desc">{incident.description}</p>

              {/* Photo Evidence Preview */}
              {incident.evidence.length > 0 && (
                <div
                  className="feed-card-image-box"
                  onClick={() => handleOpenIncident(incident)}
                >
                  <img
                    src={incident.evidence[0].url}
                    alt={incident.title}
                    className="feed-card-img"
                  />
                  <div className="feed-image-caption">
                    Evidence · {incident.evidence[0].contributorName} · {incident.evidence[0].timestamp}
                  </div>
                </div>
              )}

              {/* Incident Matching Visualization (Section 12: AI Intelligence Indicator) */}
              {incident.aiSuggestion && incident.aiSuggestion.relatedReportCount > 0 && (
                <div className="incident-cluster-ai-banner">
                  <div className="cluster-banner-text">
                    <Sparkles size={14} className="sparkle-agent-icon" />
                    <span>
                      CivicSignal detected <strong>{incident.aiSuggestion.relatedReportCount}</strong> related reports
                      (Same location · Similar evidence · Proximity cluster)
                    </span>
                  </div>
                  <button
                    className="cluster-review-action-btn"
                    onClick={(e) => handleOpenReviewGrouping(e, incident)}
                  >
                    View Incident Cluster
                  </button>
                </div>
              )}

              {/* Incident Room Threshold Progress (Section 13) */}
              <div className="incident-room-progress-card">
                <div className="room-progress-label-row">
                  <span className="room-progress-title">
                    {isRoomActive
                      ? '🏛️ Community Incident Room Activated'
                      : 'Community Room Activation Progress'}
                  </span>
                  <span className="room-progress-counter">
                    <strong>{incident.counts.uniqueContributors}</strong> / 50 contributors
                  </span>
                </div>
                <div className="room-progress-bar-track">
                  <div
                    className="room-progress-bar-fill"
                    style={{
                      width: `${Math.min(100, (incident.counts.uniqueContributors / 50) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Civic Gestures Action Toolbar (Section 11 & 24) */}
              <div className="feed-card-gestures-toolbar">
                {/* 1. "I saw it" / "I didn't see it" (Mutually Exclusive) */}
                <div className="gestures-segmented-control" role="group" aria-label="Incident observation">
                  <button
                    type="button"
                    className={`gesture-obs-btn saw-it ${incident.userGestures.witnessed ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGesture(incident.id, 'witnessed');
                    }}
                    title="Confirm you saw this civic issue"
                  >
                    <Eye size={14} />
                    <span>I saw this</span>
                    <span className="gesture-count-chip">{incident.counts.witnesses}</span>
                  </button>

                  <button
                    type="button"
                    className={`gesture-obs-btn did-not-see ${incident.userGestures.didNotSee ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGesture(incident.id, 'didNotSee');
                    }}
                    title="Report that you checked and did not see this"
                  >
                    <EyeOff size={14} />
                    <span>I didn't see it</span>
                    <span className="gesture-count-chip">{incident.counts.didNotSeeCount ?? 0}</span>
                  </button>
                </div>

                {/* Additional Meaningful Civic Gestures (Section 11) */}
                <div className="gestures-secondary-group">
                  <button
                    type="button"
                    className={`gesture-action-chip ${incident.userGestures.affected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGesture(incident.id, 'affected');
                    }}
                    title="Impacts your daily routine or residence"
                  >
                    <MapPin size={13} />
                    <span>Same issue here ({incident.counts.affected})</span>
                  </button>

                  <button
                    type="button"
                    className="gesture-action-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIncident(incident);
                    }}
                    title="Join incident or contribute photo corroboration"
                  >
                    <Users size={13} />
                    <span>Join incident ({incident.counts.evidenceItems})</span>
                  </button>

                  <button
                    type="button"
                    className="gesture-action-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIncident(incident);
                    }}
                    title="View community discussions"
                  >
                    <MessageSquare size={13} />
                    <span>{incident.counts.discussions}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
};
