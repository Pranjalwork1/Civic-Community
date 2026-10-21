import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Plus,
  Eye,
  Users,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Droplets,
  Zap,
  Trash2,
  SlidersHorizontal,
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
    resetDraft,
    setWizardStep,
    selectedLocation,
    selectedRadiusKm,
    setIsLocationModalOpen,
    currentUser,
    notifications,
  } = useCivic();

  const [sortBy, setSortBy] = useState<'recent' | 'activity' | 'closest'>('recent');
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d'>('all');
  const [composerText, setComposerText] = useState('');

  const localityName = selectedLocation?.locality || 'Knowledge Park III';
  const firstName = currentUser?.name ? currentUser.name.trim().split(' ')[0] : 'Ravi';

  // Dynamic greeting based on hour of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartReport = (initialTitle?: string) => {
    resetDraft();
    setWizardStep(1);
    setActiveView('report_wizard');
  };

  const handleOpenIncident = (incident: IncidentRecord) => {
    setCurrentIncidentId(incident.id);
    setActiveView('incident_detail');
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

    return true;
  });

  // Sorting
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === 'closest' || activeFeedTab === 'nearby') {
      return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
    }
    if (sortBy === 'activity') {
      const aScore = a.counts.witnesses + a.counts.affected + a.counts.discussions;
      const bScore = b.counts.witnesses + b.counts.affected + b.counts.discussions;
      return bScore - aScore;
    }
    return 0; // Default most recent
  });

  const openIssuesCount = sortedIncidents.filter((i) => i.status !== 'resolved').length;
  const unreadAlertsCount = notifications.filter((n) => !n.isRead).length || 6;
  const activeNeighboursCount = 42;

  // Primary categories from target.png:
  // "All", "Roads and footpaths", "Street lighting", "Waste and sanitation", "Water and drainage"
  const standardCategoryChips = [
    { id: 'all', label: 'All' },
    { id: 'roads_footpaths', label: 'Roads and footpaths' },
    { id: 'streetlighting_electrical', label: 'Street lighting' },
    { id: 'waste_sanitation', label: 'Waste and sanitation' },
    { id: 'water_drainage', label: 'Water and drainage' },
  ];

  return (
    <div className="main-feed-column" role="region" aria-label="Home Feed">
      {/* ====================================================================
          A. Greeting Section
          ==================================================================== */}
      <section className="feed-greeting-section" aria-label="Greeting">
        <h1 className="feed-greeting-title">
          {getGreeting()}, {firstName}
        </h1>
        <p className="feed-greeting-subtitle">
          Here is what is happening in {localityName}.
        </p>
      </section>

      {/* ====================================================================
          B. Three Stat Cards
          ==================================================================== */}
      <section className="feed-stats-grid" aria-label="Community Statistics">
        {/* Stat 1: OPEN ISSUES */}
        <div className="feed-stat-card">
          <span className="stat-card-label">OPEN ISSUES</span>
          <span className="stat-card-number">{openIssuesCount}</span>
        </div>

        {/* Stat 2: ACTIVE NEIGHBOURS */}
        <div className="feed-stat-card">
          <span className="stat-card-label">ACTIVE NEIGHBOURS</span>
          <span className="stat-card-number">{activeNeighboursCount}</span>
        </div>

        {/* Stat 3: UNREAD ALERTS */}
        <div className="feed-stat-card">
          <span className="stat-card-label">UNREAD ALERTS</span>
          <span className="stat-card-number stat-orange">{unreadAlertsCount}</span>
        </div>
      </section>

      {/* ====================================================================
          C. Composer Card
          ==================================================================== */}
      <section className="feed-composer-card" aria-label="Quick Issue Composer">
        <div className="composer-avatar" aria-hidden="true">
          CS
        </div>

        <input
          type="text"
          className="composer-input-pill"
          placeholder="What civic issue or hazard did you observe?"
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleStartReport(composerText);
            }
          }}
          aria-label="What civic issue or hazard did you observe?"
        />

        <button
          type="button"
          className="composer-chip-btn"
          onClick={() => handleStartReport(composerText)}
          aria-label="Add photo"
        >
          <Camera size={16} strokeWidth={2} aria-hidden="true" />
          <span>Photo</span>
        </button>

        <button
          type="button"
          className="composer-chip-btn"
          onClick={() => setIsLocationModalOpen(true)}
          aria-label="Add location"
        >
          <MapPin size={16} strokeWidth={2} aria-hidden="true" />
          <span>Location</span>
        </button>

        <button
          type="button"
          className="composer-post-btn"
          onClick={() => handleStartReport(composerText)}
          aria-label="Post report"
        >
          Post
        </button>
      </section>

      {/* ====================================================================
          D. Filter Row: Scrollable Category Chips + Sort & Time Chips
          ==================================================================== */}
      <section className="feed-filter-row" aria-label="Filter Feed">
        {/* Left: Scrollable Categories */}
        <div className="category-chips-wrapper">
          <div className="category-chips-track" role="tablist" aria-label="Categories">
            {standardCategoryChips.map((chip) => {
              const isActive = activeCategoryFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`category-chip ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategoryFilter(chip.id)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          {/* Subtle scroll indicator bar matching target.png */}
          <div className="category-scroll-bar" aria-hidden="true">
            <div className="category-scroll-thumb" />
          </div>
        </div>

        {/* Right: Sort & Time Chips */}
        <div className="feed-sort-chips-group">
          <button
            type="button"
            className="feed-option-chip"
            onClick={() => {
              setSortBy((prev) => (prev === 'recent' ? 'activity' : 'recent'));
            }}
            title="Toggle sort order"
            aria-label={`Sort order: ${sortBy === 'recent' ? 'Most recent' : 'Recent activity'}`}
          >
            {sortBy === 'recent' ? 'Most recent' : 'Recent activity'}
          </button>

          <button
            type="button"
            className="feed-option-chip"
            onClick={() => {
              setTimeFilter((prev) => (prev === 'all' ? '24h' : 'all'));
            }}
            title="Toggle time filter"
            aria-label={`Time filter: ${timeFilter === 'all' ? 'All time' : 'Past 24h'}`}
          >
            {timeFilter === 'all' ? 'All time' : 'Past 24h'}
          </button>
        </div>
      </section>

      {/* ====================================================================
          E. Feed Incident Cards OR Empty State Card
          ==================================================================== */}
      {sortedIncidents.length === 0 ? (
        <section className="feed-empty-card" aria-label="No civic issues found">
          {/* 96px rounded tinted tile with map-pin-check icon */}
          <div className="empty-pin-tile" aria-hidden="true">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D93A00"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <path d="m9 10 2 2 4-4" />
            </svg>
          </div>

          <h2 className="empty-card-heading">All quiet in {localityName}</h2>

          <p className="empty-card-paragraph">
            No civic issues have been reported nearby yet. Spot a broken light, a
            blocked drain or a damaged road? Be the first to document it.
          </p>

          <div className="empty-card-actions">
            <button
              type="button"
              className="empty-primary-btn"
              onClick={() => handleStartReport()}
              aria-label="Report a civic issue"
            >
              <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
              <span>Report a civic issue</span>
            </button>

            <button
              type="button"
              className="empty-secondary-btn"
              onClick={() => setIsLocationModalOpen(true)}
              aria-label="Choose another location"
            >
              Choose another location
            </button>
          </div>
        </section>
      ) : (
        <div className="feed-incidents-list">
          {sortedIncidents.map((incident) => {
            const isUrgent = incident.severity === 'critical' || incident.severity === 'high';
            return (
              <article key={incident.id} className="feed-incident-card">
                {/* Header row */}
                <div className="incident-card-header">
                  <div className="incident-reporter-avatar" aria-hidden="true">
                    {incident.reporter.avatar}
                  </div>
                  <div className="incident-reporter-meta">
                    <span className="reporter-name">{incident.reporter.name}</span>
                    <span className="reporter-dot">·</span>
                    <span className="reporter-time">{incident.createdAt}</span>
                    <span className="reporter-dot">·</span>
                    <span className="reporter-locality">{incident.locality}</span>
                  </div>

                  <div className="incident-header-badges">
                    {isUrgent && (
                      <span className="incident-hazard-badge">
                        <ShieldAlert size={12} strokeWidth={2} />
                        <span>Hazard</span>
                      </span>
                    )}
                    <span className="incident-category-badge">{incident.category}</span>
                  </div>
                </div>

                {/* Title */}
                <h2
                  className="incident-title"
                  onClick={() => handleOpenIncident(incident)}
                >
                  {incident.title}
                </h2>

                {/* Description */}
                <p className="incident-desc">{incident.description}</p>

                {/* Evidence Image */}
                {incident.evidence.length > 0 && (
                  <div
                    className="incident-evidence-box"
                    onClick={() => handleOpenIncident(incident)}
                  >
                    <img
                      src={incident.evidence[0].url}
                      alt={incident.title}
                      className="incident-evidence-image"
                    />
                    <div className="incident-evidence-caption">
                      <MapPin size={12} strokeWidth={2} />
                      <span>
                        {incident.landmark} · {incident.distanceKm !== undefined ? formatDistance(incident.distanceKm) : 'Nearby'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="incident-footer-row">
                  <button
                    type="button"
                    className="incident-gesture-btn"
                    onClick={() => toggleGesture(incident.id, 'witnessed')}
                    aria-label={`Saw it, ${incident.counts.witnesses} witnesses`}
                  >
                    <Eye size={15} strokeWidth={2} />
                    <span>{incident.counts.witnesses} Saw it</span>
                  </button>

                  <button
                    type="button"
                    className="incident-gesture-btn"
                    onClick={() => toggleGesture(incident.id, 'affected')}
                    aria-label={`Affected, ${incident.counts.affected} affected`}
                  >
                    <Users size={15} strokeWidth={2} />
                    <span>{incident.counts.affected} Affected</span>
                  </button>

                  <button
                    type="button"
                    className="incident-gesture-btn"
                    onClick={() => handleOpenIncident(incident)}
                    aria-label={`Discussions, ${incident.counts.discussions} comments`}
                  >
                    <MessageSquare size={15} strokeWidth={2} />
                    <span>{incident.counts.discussions} Comments</span>
                  </button>

                  <button
                    type="button"
                    className="incident-view-details-btn"
                    onClick={() => handleOpenIncident(incident)}
                    aria-label="View report details"
                  >
                    <span>View details</span>
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
