import React from 'react';
import {
  Compass,
  MapPin,
  BookmarkCheck,
  MessagesSquare,
  FileText,
  Bell,
  Bookmark,
  ShieldAlert,
  Flame,
  Droplet,
  Trash2,
  Zap,
  HardHat,
  Search,
  Users,
  ChevronRight,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ISSUE_CATEGORIES } from '../../data/categories';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    rooms,
    incidents,
    notifications,
    resetDraft,
    setWizardStep,
    selectedLocation,
    setIsLocationModalOpen,
    activeCategoryFilter,
    setActiveCategoryFilter,
    currentUser,
  } = useCivic();

  const activeRoomsCount = rooms.length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleStartReport = () => {
    resetDraft();
    setWizardStep(1);
    setActiveView('report_wizard');
  };

  const getCategoryCount = (categoryId: string) => {
    return incidents.filter((i) => i.categoryId === categoryId).length;
  };

  return (
    <aside className="left-sidebar" aria-label="Main Navigation">
      {/* 1. CivicSignal Brand Logo */}
      <div className="sidebar-brand-box">
        <button
          className="sidebar-brand-link"
          onClick={() => {
            setActiveCategoryFilter('all');
            setActiveView('explore');
          }}
          title="CivicSignal Home"
        >
          <div className="sidebar-logo-icon">
            <ShieldAlert size={18} />
          </div>
          <span className="sidebar-logo-text">CivicSignal</span>
        </button>
      </div>

      <div className="sidebar-nav-scroll-area">
        {/* 2. FEEDS */}
        <div className="sidebar-nav-section">
          <div className="sidebar-section-title">FEEDS</div>

          <button
            className={`sidebar-nav-link ${activeView === 'explore' && activeCategoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategoryFilter('all');
              setActiveView('explore');
            }}
          >
            <Compass size={17} className="sidebar-icon" />
            <span className="sidebar-link-text">Home Feed</span>
            <span className="sidebar-link-badge">{incidents.length}</span>
          </button>

          <button
            className="sidebar-nav-link"
            onClick={() => {
              setActiveCategoryFilter('all');
              setActiveView('explore');
            }}
          >
            <MapPin size={17} className="sidebar-icon" />
            <span className="sidebar-link-text">Nearby Radar</span>
          </button>

          <button
            className="sidebar-nav-link"
            onClick={() => setActiveView('explore')}
          >
            <BookmarkCheck size={17} className="sidebar-icon" />
            <span className="sidebar-link-text">Following</span>
          </button>
        </div>

        {/* 3. CIVIC WORKSPACES */}
        <div className="sidebar-nav-section">
          <div className="sidebar-section-title">CIVIC WORKSPACES</div>

          <button
            className={`sidebar-nav-link ${activeView === 'incident_room' ? 'active' : ''}`}
            onClick={() => {
              if (rooms.length > 0) {
                setActiveView('incident_room');
              } else {
                alert('Incident Rooms unlock when 50 unique neighbors corroborate an issue! You can trigger this using Dev Tools at the bottom-right.');
              }
            }}
          >
            <MessagesSquare size={17} className="sidebar-icon" />
            <span className="sidebar-link-text">Incident Rooms</span>
            {activeRoomsCount > 0 && (
              <span className="sidebar-link-badge room-badge">{activeRoomsCount}</span>
            )}
          </button>

          <button
            className={`sidebar-nav-link ${activeView === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveView('tracking')}
          >
            <FileText size={17} className="sidebar-icon" />
            <span className="sidebar-link-text">Petitions & Tracking</span>
          </button>

          <button
            className={`sidebar-nav-link ${activeView === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveView('notifications')}
          >
            <Bell size={17} className="sidebar-icon" />
            <span className="sidebar-link-text">Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="sidebar-link-badge alert-badge">{unreadNotifsCount}</span>
            )}
          </button>

          <button
            className="sidebar-nav-link"
            onClick={() => setActiveView('explore')}
          >
            <Bookmark size={17} className="sidebar-icon" />
            <span className="sidebar-link-text">Saved Reports</span>
          </button>
        </div>

        {/* 4. CIVIC TOPICS */}
        <div className="sidebar-nav-section">
          <div className="sidebar-section-title">CIVIC TOPICS</div>

          {ISSUE_CATEGORIES.slice(0, 7).map((cat) => {
            const count = getCategoryCount(cat.id);
            const isSelected = activeView === 'explore' && activeCategoryFilter === cat.id;

            return (
              <button
                key={cat.id}
                className={`sidebar-nav-link ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategoryFilter(cat.id);
                  setActiveView('explore');
                }}
              >
                <span className="sidebar-topic-icon">{cat.icon}</span>
                <span className="sidebar-link-text">{cat.name}</span>
                {count > 0 && <span className="sidebar-topic-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* 5. CURRENT COMMUNITY */}
        <div className="sidebar-community-box">
          <div className="community-box-label">CURRENT COMMUNITY</div>
          <div className="community-box-name">
            {selectedLocation ? selectedLocation.locality : 'Knowledge Park III'}
          </div>
          <div className="community-box-city">
            {selectedLocation ? selectedLocation.city : 'Greater Noida'}
          </div>
          <div className="community-box-actions">
            <button
              className="community-box-change-btn"
              onClick={() => setIsLocationModalOpen(true)}
            >
              Change Location
            </button>
            <button
              className="community-box-report-btn"
              onClick={handleStartReport}
            >
              + Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* 6. User Profile at Bottom (Section 4) */}
      <div className="sidebar-bottom-profile">
        <div className="bottom-profile-avatar">{currentUser.avatar}</div>
        <div className="bottom-profile-info">
          <div className="bottom-profile-name">{currentUser.name}</div>
          <div className="bottom-profile-role">
            {currentUser.role === 'community_leader'
              ? 'Community Leader'
              : 'Verified Resident'}
          </div>
        </div>
      </div>
    </aside>
  );
};
