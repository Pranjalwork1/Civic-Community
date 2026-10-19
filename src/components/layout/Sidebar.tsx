import React from 'react';
import {
  Compass,
  MapPin,
  BookmarkCheck,
  MessagesSquare,
  FileText,
  Bell,
  Bookmark,
  LayoutGrid,
  ShieldAlert,
  Flame,
  Droplet,
  Trash2,
  Zap,
  HardHat,
  Search,
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
    <aside className="left-sidebar">
      <div className="sidebar-scrollable-content">
        {/* Navigation Group 1: Feeds */}
        <div className="sidebar-nav-group">
          <div className="sidebar-group-title">FEEDS</div>
          <button
            className={`sidebar-nav-item ${activeView === 'explore' && activeCategoryFilter === 'all' ? 'active-pill' : ''}`}
            onClick={() => {
              setActiveCategoryFilter('all');
              setActiveView('explore');
            }}
          >
            <Compass size={17} />
            <span className="nav-label">Home Feed</span>
            <span className="nav-badge-pill">{incidents.length}</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => {
              setActiveCategoryFilter('all');
              setActiveView('explore');
            }}
          >
            <MapPin size={17} />
            <span className="nav-label">Nearby Radar</span>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => {
              setActiveView('explore');
            }}
          >
            <BookmarkCheck size={17} />
            <span className="nav-label">Following</span>
          </button>
        </div>

        {/* Navigation Group 2: Civic Workspaces */}
        <div className="sidebar-nav-group">
          <div className="sidebar-group-title">CIVIC WORKSPACES</div>

          <button
            className={`sidebar-nav-item ${activeView === 'incident_room' ? 'active-pill' : ''}`}
            onClick={() => {
              if (rooms.length > 0) {
                setActiveView('incident_room');
              } else {
                alert('Incident Rooms unlock when 50 unique neighbors corroborate an issue! Try simulating 50 contributors on the BMSCE college gate pothole issue.');
              }
            }}
          >
            <MessagesSquare size={17} />
            <span className="nav-label">Incident Rooms</span>
            {activeRoomsCount > 0 && <span className="nav-badge-count">{activeRoomsCount}</span>}
          </button>

          <button
            className={`sidebar-nav-item ${activeView === 'tracking' ? 'active-pill' : ''}`}
            onClick={() => setActiveView('tracking')}
          >
            <FileText size={17} />
            <span className="nav-label">Petitions & Tracking</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeView === 'notifications' ? 'active-pill' : ''}`}
            onClick={() => setActiveView('notifications')}
          >
            <Bell size={17} />
            <span className="nav-label">Notifications</span>
            {unreadNotifsCount > 0 && <span className="nav-badge-count">{unreadNotifsCount}</span>}
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => setActiveView('explore')}
          >
            <Bookmark size={17} />
            <span className="nav-label">Saved Reports</span>
          </button>
        </div>

        {/* Navigation Group 3: Civic Categories / Topics (Inspired by Reference Image Topics) */}
        <div className="sidebar-nav-group">
          <div className="sidebar-group-title">CIVIC TOPICS</div>

          {ISSUE_CATEGORIES.slice(0, 5).map((cat) => {
            const count = getCategoryCount(cat.id);
            const isSelected = activeView === 'explore' && activeCategoryFilter === cat.id;

            return (
              <button
                key={cat.id}
                className={`sidebar-nav-item ${isSelected ? 'active-pill' : ''}`}
                onClick={() => {
                  setActiveCategoryFilter(cat.id);
                  setActiveView('explore');
                }}
              >
                <span className="category-emoji-dot">{cat.icon}</span>
                <span className="nav-label">{cat.name}</span>
                {count > 0 && <span className="nav-count-subtle">{count}</span>}
              </button>
            );
          })}

          <button
            className="sidebar-more-btn"
            onClick={() => {
              setActiveCategoryFilter('all');
              setActiveView('explore');
            }}
          >
            <span>••• All Categories</span>
          </button>
        </div>
      </div>

      {/* Selected Community Card (Sticky at bottom of sidebar) */}
      <div className="sidebar-community-card">
        <div className="community-card-top">
          <div className="community-pill-locality">
            c/{selectedLocation ? selectedLocation.locality : 'Basavanagudi'}
          </div>
          <button
            className="community-change-btn"
            onClick={() => setIsLocationModalOpen(true)}
            title="Change browsing neighborhood"
          >
            Change
          </button>
        </div>

        <div className="community-card-city">
          {selectedLocation
            ? `${selectedLocation.city} · ${selectedLocation.source === 'sample' ? 'Demo Area' : 'Selected Area'}`
            : 'Bengaluru · Karnataka'}
        </div>

        <div className="community-quote">
          "Your community. One voice. Real civic action."
        </div>

        <button className="sidebar-action-report-btn" onClick={handleStartReport}>
          + Report an Issue
        </button>
      </div>
    </aside>
  );
};
