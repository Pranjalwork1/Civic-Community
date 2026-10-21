import React, { useState } from 'react';
import {
  Search,
  Bell,
  MapPin,
  Plus,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DEMO_USERS } from '../../data/mockData';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead,
    setActiveView,
    setWizardStep,
    resetDraft,
    resetAllDemoData,
    selectedLocation,
    setIsLocationModalOpen,
  } = useCivic();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const handleStartReport = () => {
    resetDraft();
    setWizardStep(1);
    setActiveView('report_wizard');
  };

  const getInitials = (name: string) => {
    if (!name) return 'RK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const localityName = selectedLocation?.locality || 'Knowledge Park III';

  return (
    <header className="top-navbar-container">
      <div className="top-navbar-inner">
        {/* Left: Brand Logo & Wordmark */}
        <div className="navbar-brand-section">
          <button
            type="button"
            className="navbar-brand-btn"
            onClick={() => setActiveView('explore')}
            aria-label="CivicSignal Home"
          >
            <div className="navbar-logo-icon" aria-hidden="true">
              <Shield size={20} strokeWidth={2.2} />
            </div>
            <span className="navbar-brand-name">CivicSignal</span>
          </button>
        </div>

        {/* Center: Search Pill */}
        <div className="navbar-search-section">
          <div className="navbar-search-pill">
            <Search size={18} strokeWidth={2} className="navbar-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search issues, communities, places"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search issues, communities, places"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="navbar-actions-section">
          {/* Location Chip */}
          <button
            type="button"
            className="navbar-location-chip"
            onClick={() => setIsLocationModalOpen(true)}
            title="Change browsing location"
            aria-label={`Current location: ${localityName}. Click to change.`}
          >
            <MapPin size={16} strokeWidth={2} className="navbar-location-icon" aria-hidden="true" />
            <span className="navbar-location-text">{localityName}</span>
          </button>

          {/* "+ Create report" Primary Button */}
          <button
            type="button"
            className="navbar-create-btn"
            onClick={handleStartReport}
            aria-label="Create report"
          >
            <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
            <span>Create report</span>
          </button>

          {/* Notification Bell */}
          <div className="navbar-popover-wrapper">
            <button
              type="button"
              className="navbar-icon-btn navbar-bell-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label={`Notifications, ${unreadNotifs.length} unread`}
              aria-expanded={isNotifOpen}
            >
              <Bell size={18} strokeWidth={2} aria-hidden="true" />
              {unreadNotifs.length > 0 && (
                <span className="navbar-bell-dot" aria-hidden="true" />
              )}
            </button>

            {isNotifOpen && (
              <div className="navbar-dropdown-panel navbar-notifs-panel" role="dialog" aria-label="Notifications panel">
                <div className="navbar-dropdown-header">
                  <span className="navbar-dropdown-title">Notifications</span>
                  <span className="navbar-dropdown-badge">{unreadNotifs.length} new</span>
                </div>
                <div className="navbar-notifs-list">
                  {notifications.length === 0 ? (
                    <div className="navbar-empty-text">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`navbar-notif-item ${n.isRead ? 'read' : 'unread'}`}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkTab) setActiveView(n.linkTab as any);
                          setIsNotifOpen(false);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="navbar-notif-title">{n.title}</div>
                        <div className="navbar-notif-body">{n.body}</div>
                        <div className="navbar-notif-time">{n.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div className="navbar-popover-wrapper">
            <button
              type="button"
              className="navbar-user-chip"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label={`User profile: ${currentUser.name}`}
              aria-expanded={isUserMenuOpen}
            >
              <div className="navbar-user-avatar" aria-hidden="true">
                {currentUser.avatar || getInitials(currentUser.name)}
              </div>
              <div className="navbar-user-meta">
                <span className="navbar-user-name">{currentUser.name || 'Ravi Kumar'}</span>
                <span className="navbar-user-role">
                  {currentUser.role === 'community_leader'
                    ? 'Community Leader'
                    : 'Verified resident'}
                </span>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="navbar-dropdown-panel navbar-user-panel" role="menu">
                <div className="navbar-user-info-box">
                  <div className="navbar-user-full-name">{currentUser.name}</div>
                  <div className="navbar-user-email">{currentUser.email}</div>
                  <div className="navbar-user-locality">{localityName}</div>
                </div>

                <div className="navbar-menu-heading">Switch Persona</div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`navbar-persona-btn ${currentUser.id === u.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentUser(u);
                      setIsUserMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <span className="navbar-persona-avatar">{u.avatar}</span>
                    <span className="navbar-persona-name">{u.name}</span>
                  </button>
                ))}

                <div className="navbar-menu-divider" />
                <button
                  type="button"
                  className="navbar-reset-btn"
                  onClick={() => {
                    resetAllDemoData();
                    setIsUserMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
