import React, { useState } from 'react';
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
  Compass,
  ArrowRight,
  ShieldAlert,
  Flame,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  MoreHorizontal,
  HelpCircle,
  Layers,
  Activity,
  Check,
  Zap,
  Droplets,
  Trash2,
  CloudRain,
  Building2,
  Waves,
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
  } = useCivic();

  // Sort & Time Filter states
  const [sortBy, setSortBy] = useState<'recent' | 'activity' | 'closest' | 'community'>('recent');
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);

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

  // Calculate real geographic distance for all incidents
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

  // Filter incidents strictly based on location radius, search, category, and tabs
  const filteredIncidents = incidentsWithDistance.filter((inc) => {
    // Proximity / Radius filter:
    if (selectedLocation) {
      if (inc.distanceKm !== undefined && inc.distanceKm > selectedRadiusKm) {
        return false;
      }
    }

    // Search query: supports title, description, category, reference, locality, landmarks
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

    // Feed Tabs filtering
    if (activeFeedTab === 'unresolved') {
      return inc.status !== 'resolved';
    }
    if (activeFeedTab === 'resolved') {
      return inc.status === 'resolved';
    }
    if (activeFeedTab === 'needs_attention') {
      return inc.severity === 'high' || inc.counts.witnesses > 10;
    }
    if (activeFeedTab === 'communities') {
      return inc.counts.uniqueContributors >= 50 || inc.status === 'room_active' || !!inc.roomId;
    }

    // Time filter
    if (timeFilter === '24h') {
      return inc.createdAt.includes('hour') || inc.createdAt.includes('Just now') || inc.createdAt.includes('minute') || inc.createdAt.includes('Today');
    }
    if (timeFilter === '7d') {
      return !inc.createdAt.includes('month') && !inc.createdAt.includes('year');
    }

    return true;
  });

  // Sorting logic
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === 'closest' || activeFeedTab === 'nearby') {
      return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
    }
    if (sortBy === 'community') {
      return b.counts.uniqueContributors - a.counts.uniqueContributors;
    }
    if (sortBy === 'activity' || activeFeedTab === 'recently_updated') {
      const aScore = a.counts.witnesses + a.counts.affected + a.counts.discussions;
      const bScore = b.counts.witnesses + b.counts.affected + b.counts.discussions;
      return bScore - aScore;
    }
    return 0; // Default most recent
  });

  return (
    <div className="center-content" role="region" aria-label="Central Civic Feed">
      {/* ====================================================================
          1. REDDIT-INSPIRED LOCATION & FEED FILTER BAR (Directly matching screenshot)
          ==================================================================== */}
      <section className="reddit-filter-bar" aria-label="Feed Filters and Sorting">
        {/* Left: Location Dropdown Pill */}
        <button
          className="filter-location-pill"
          onClick={() => setIsLocationModalOpen(true)}
          title="Change browsing location"
        >
          <span className="location-flag-badge">📍</span>
          <span className="location-name-label">
            {selectedLocation ? selectedLocation.locality : 'Knowledge Park III, Greater Noida'}
          </span>
          <ChevronDown size={14} className="location-chevron" />
        </button>

        {/* Center: Feed Ranking Tabs (All, Hot/Nearby, New/Unresolved, Rising/Recently Updated, etc.) */}
        <div className="filter-tabs-row">
          {[
            { id: 'all', label: 'All' },
            { id: 'nearby', label: 'Nearby' },
            { id: 'unresolved', label: 'Unresolved' },
            { id: 'recently_updated', label: 'Rising' }, // Vibrant orange active pill matching Reddit ref screenshot!
            { id: 'needs_attention', label: 'Needs Attention' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'communities', label: 'Communities' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-tab-btn ${activeFeedTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveFeedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Sorting & Time Dropdowns */}
        <div className="filter-dropdowns-group">
          {/* Sort Selector */}
          <select
            className="filter-select-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort Incidents"
          >
            <option value="recent">Most Recent</option>
            <option value="activity">Recent Activity</option>
            <option value="closest">Closest</option>
            <option value="community">Most Community Action</option>
          </select>

          {/* Time Filter Dropdown (like Past 24 Hours in screenshot) */}
          <select
            className="filter-select-dropdown"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            aria-label="Time Window"
          >
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </section>

      {/* ====================================================================
          2. HORIZONTAL CATEGORY CHIPS ROW (Section 8: Scrollable, no page overflow)
          ==================================================================== */}
      <div className="categories-scroll-wrapper" aria-label="Issue Categories">
        <div className="categories-scroll-track">
          <button
            className={`category-filter-pill ${activeCategoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategoryFilter('all')}
          >
            All Categories
          </button>
          {ISSUE_CATEGORIES.map((cat) => {
            const renderCatIcon = (iconName: string) => {
              switch (iconName) {
                case 'Zap': return <Zap size={13} color="#f59e0b" />;
                case 'Trash2': return <Trash2 size={13} color="#10b981" />;
                case 'Waves': return <Waves size={13} color="#0284c7" />;
                case 'Droplets': return <Droplets size={13} color="#06b6d4" />;
                case 'CloudRain': return <CloudRain size={13} color="#3b82f6" />;
                case 'Building2': return <Building2 size={13} color="#8b5cf6" />;
                case 'Users2': return <Users size={13} color="#ec4899" />;
                case 'ShieldAlert': return <ShieldAlert size={13} color="#ef4444" />;
                default: return <Compass size={13} color="#64748b" />;
              }
            };
            return (
              <button
                key={cat.id}
                className={`category-filter-pill ${activeCategoryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter(cat.id)}
              >
                <span className="cat-pill-icon">{renderCatIcon(cat.icon)}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          3. COMPACT REPORT CREATOR BAR
          ==================================================================== */}
      <section className="reddit-composer-box" onClick={handleStartReport}>
        <div className="composer-avatar-circle">CS</div>
        <div className="composer-input-placeholder">
          What civic issue or hazard did you observe in {selectedLocation?.locality || 'your community'}?
        </div>
        <div className="composer-quick-actions">
          <button
            type="button"
            className="composer-quick-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleStartReport();
            }}
            title="Open Camera"
          >
            <Camera size={15} color="#FF4D1A" />
            <span>Camera</span>
          </button>
          <button
            type="button"
            className="composer-quick-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleStartReport();
            }}
            title="Use current location"
          >
            <MapPin size={15} color="#0284c7" />
            <span>Location</span>
          </button>
          <button
            type="button"
            className="composer-create-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleStartReport();
            }}
          >
            + Create
          </button>
        </div>
      </section>

      {/* ====================================================================
          4. CENTRAL INCIDENT CARDS (Clean White Reddit-Style Post Cards)
          ==================================================================== */}
      {sortedIncidents.length === 0 ? (
        /* Compact Empty State (Section 10) */
        <div className="compact-empty-state">
          <div className="empty-state-icon-wrap">
            <MapPin size={24} />
          </div>
          <h3 className="empty-state-title">No civic issues reported nearby yet</h3>
          <p className="empty-state-sub">
            Be the first person to document and report a problem in {selectedLocation?.locality || 'this neighborhood'}.
          </p>
          <div className="empty-state-actions">
            <button className="btn-empty-report" onClick={handleStartReport}>
              <PlusCircle size={15} />
              <span>Report a Civic Issue</span>
            </button>
            <button
              className="btn-empty-radar"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <Compass size={15} />
              <span>Choose Another Location</span>
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
            <article key={incident.id} className="reddit-incident-card">
              {/* A. Report Header: Author, Date, Locality, Ref, Category */}
              <div className="card-header-line">
                <div className="card-header-left">
                  <div className="card-author-avatar">{incident.reporter.avatar}</div>
                  <div className="card-meta-line">
                    <span className="card-posted-by">Posted by : </span>
                    <strong className="card-author-name">{incident.reporter.name}</strong>
                    <span className="card-meta-sep">|</span>
                    <span className="card-timestamp">{incident.createdAt}</span>
                    <span className="card-meta-sep">|</span>
                    <span className="card-locality-tag">
                      <MapPin size={11} className="inline-pin-icon" />
                      {incident.locality}
                    </span>
                    <span className="card-meta-sep">|</span>
                    <span className="card-ref-badge">{incident.reference}</span>
                  </div>
                </div>

                <div className="card-header-right">
                  {isUrgentHazard && (
                    <span className="card-hazard-pill">
                      <ShieldAlert size={12} />
                      <span>Urgent Hazard</span>
                    </span>
                  )}
                  <span className="card-category-pill">{incident.category}</span>
                  <button
                    className="card-overflow-btn"
                    onClick={() => setOpenCardMenuId(openCardMenuId === incident.id ? null : incident.id)}
                    title="More actions"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>

              {/* B. Incident Heading */}
              <h2
                className="card-incident-heading"
                onClick={() => handleOpenIncident(incident)}
              >
                {incident.title}
              </h2>

              {/* C. Description Preview */}
              <p className="card-incident-description">{incident.description}</p>

              {/* D. Evidence Photograph with Geotag Context */}
              {incident.evidence.length > 0 && (
                <div
                  className="card-evidence-frame"
                  onClick={() => handleOpenIncident(incident)}
                >
                  <img
                    src={incident.evidence[0].url}
                    alt={incident.title}
                    className="card-evidence-image"
                  />
                  <div className="card-geotag-banner">
                    <div className="geotag-banner-left">
                      <MapPin size={12} className="geotag-pin" />
                      <span>
                        {incident.locality} · Coordinates: {incident.location.lat.toFixed(4)}° N, {incident.location.lng.toFixed(4)}° E
                      </span>
                    </div>
                    <span className="geotag-verified-badge">✓ Geotag Verified</span>
                  </div>
                </div>
              )}

              {/* E. Location & Landmark Info */}
              <div className="card-location-row">
                <MapPin size={13} className="landmark-pin" />
                <span className="landmark-title">Landmark: {incident.landmark}</span>
                {incident.distanceKm !== undefined && (
                  <span className="landmark-distance-pill">
                    · {formatDistance(incident.distanceKm)} from your browsing location
                  </span>
                )}
              </div>

              {/* AI Incident Cluster Detection Intelligence Indicator (Section 12) */}
              {incident.aiSuggestion?.groupingStatus === 'reviewed' && (
                <div className="card-ai-cluster-banner">
                  <div className="ai-cluster-left">
                    <div className="ai-cluster-heading">
                      <Sparkles size={14} />
                      <span>CivicSignal detected 17 related reports</span>
                    </div>
                    <div className="ai-cluster-factors">
                      <span>📍 Same location</span>
                      <span>•</span>
                      <span>🖼 Similar evidence</span>
                      <span>•</span>
                      <span>📝 Similar issue description</span>
                    </div>
                  </div>
                  <button
                    className="ai-cluster-view-btn"
                    onClick={(e) => handleOpenReviewGrouping(e, incident)}
                  >
                    View Incident Cluster
                  </button>
                </div>
              )}

              {/* Community Status & Contributor Progress Toward 50-Person Room */}
              <div className="card-community-progress-box">
                <div className="progress-box-header">
                  <span className="progress-status-title">
                    {isRoomActive
                      ? '🏛 Community Incident Room Created (Threshold Reached)'
                      : `Community Gathering Evidence: ${incident.counts.uniqueContributors} / 50 contributors`}
                  </span>
                  <span className="progress-status-chip">
                    {isRoomActive ? '✓ Room Active' : `${Math.round((incident.counts.uniqueContributors / 50) * 100)}%`}
                  </span>
                </div>
                <div className="progress-track-bar">
                  <div
                    className={`progress-fill-bar ${isRoomActive ? 'active-room' : ''}`}
                    style={{
                      width: `${Math.min(100, (incident.counts.uniqueContributors / 50) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* F. Civic Activity Summary Counters */}
              <div className="card-civic-vitals-row">
                <span className="vital-stat">
                  👁 <strong>{incident.counts.witnesses}</strong> saw it
                </span>
                <span className="vital-stat-sep">•</span>
                <span className="vital-stat">
                  ○ <strong>{incident.counts.didNotSeeCount || 0}</strong> didn't see
                </span>
                <span className="vital-stat-sep">•</span>
                <span className="vital-stat">
                  ⚠️ <strong>{incident.counts.affected}</strong> affected
                </span>
                <span className="vital-stat-sep">•</span>
                <span className="vital-stat">
                  📷 <strong>{incident.counts.evidenceItems || incident.evidence.length}</strong> evidence
                </span>
                <span className="vital-stat-sep">•</span>
                <span className="vital-stat">
                  💬 <strong>{incident.counts.discussions}</strong> discussions
                </span>
              </div>

              {/* G. Action Row: Civic Gestures (Section 7: Mutually Exclusive Observation Selector) */}
              <div className="card-action-gestures-row">
                {/* Mutually Exclusive "I Saw It" vs "I Didn't See It" */}
                <div className="observation-pair-control">
                  <button
                    type="button"
                    className={`obs-toggle-btn obs-saw-it ${incident.userGestures.witnessed ? 'selected' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'witnessed')}
                    title="Personally observed this issue (contributes to verification)"
                  >
                    <Check size={13} />
                    <span>I Saw It</span>
                    <span className="obs-counter-pill">{incident.counts.witnesses}</span>
                  </button>

                  <button
                    type="button"
                    className={`obs-toggle-btn obs-did-not-see ${incident.userGestures.didNotSee ? 'selected' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'didNotSee')}
                    title="Passed this area but did not observe the issue (neutral observation)"
                  >
                    <EyeOff size={13} />
                    <span>I Didn't See It</span>
                    <span className="obs-counter-pill">{incident.counts.didNotSeeCount || 0}</span>
                  </button>
                </div>

                {/* Secondary Civic Actions */}
                <div className="secondary-gestures-stack">
                  <button
                    type="button"
                    className={`gesture-action-pill ${incident.userGestures.affected ? 'active' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'affected')}
                    title="I am affected by this issue"
                  >
                    <Users size={13} />
                    <span>I'm Affected</span>
                    {incident.counts.affected > 0 && <span className="gesture-sub-count">{incident.counts.affected}</span>}
                  </button>

                  <button
                    type="button"
                    className="gesture-action-pill"
                    onClick={() => handleOpenIncident(incident)}
                    title="Add photo evidence"
                  >
                    <Camera size={13} />
                    <span>Add Evidence</span>
                  </button>

                  <button
                    type="button"
                    className={`gesture-action-pill ${incident.userGestures.stillHappening ? 'active' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'stillHappening')}
                    title="This issue is still ongoing"
                  >
                    <Activity size={13} />
                    <span>Still Happening</span>
                  </button>

                  <button
                    type="button"
                    className={`gesture-action-pill ${incident.userGestures.followed ? 'active' : ''}`}
                    onClick={() => toggleGesture(incident.id, 'followed')}
                    title="Follow updates for this incident"
                  >
                    <Bookmark size={13} />
                    <span>Follow</span>
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
