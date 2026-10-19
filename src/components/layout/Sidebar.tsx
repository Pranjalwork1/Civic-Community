import React from 'react';
import {
  Menu,
  Home,
  Compass,
  Flame,
  DoorOpen,
  FileText,
  Bell,
  Bookmark,
  Briefcase,
  User,
  Settings,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DEMO_USERS } from '../../data/mockData';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    rooms,
    notifications,
    setActiveCategoryFilter,
    setActiveFeedTab,
    setIsLocationModalOpen,
    currentUser,
    setCurrentUser,
  } = useCivic();

  const activeRoomsCount = rooms.length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <aside className="left-icon-rail" aria-label="Quick Navigation">
      {/* Top Hamburger Control (Reddit Style) */}
      <button
        className="rail-menu-btn"
        title="Toggle Menu / Navigation Drawer"
        aria-label="Toggle Navigation Menu"
        onClick={() => {
          setActiveCategoryFilter('all');
          setActiveFeedTab('all');
          setActiveView('explore');
        }}
      >
        <Menu size={22} />
      </button>

      {/* Primary Icon Navigation Stack */}
      <nav className="rail-icons-stack" aria-label="Icon Navigation">
        {/* 1. Home Feed */}
        <button
          className={`rail-icon-btn ${activeView === 'explore' ? 'active' : ''}`}
          onClick={() => {
            setActiveCategoryFilter('all');
            setActiveFeedTab('all');
            setActiveView('explore');
          }}
          title="Home Feed"
          aria-label="Home Feed"
        >
          <Home size={20} />
          <span className="rail-tooltip">Home Feed</span>
        </button>

        {/* 2. Nearby Radar */}
        <button
          className="rail-icon-btn"
          onClick={() => {
            setActiveCategoryFilter('all');
            setActiveFeedTab('nearby');
            setActiveView('explore');
          }}
          title="Nearby Radar"
          aria-label="Nearby Radar"
        >
          <Compass size={20} />
          <span className="rail-tooltip">Nearby Radar</span>
        </button>

        {/* 3. Following / Trending */}
        <button
          className="rail-icon-btn"
          onClick={() => {
            setActiveFeedTab('recently_updated');
            setActiveView('explore');
          }}
          title="Following & Hot Issues"
          aria-label="Following"
        >
          <Flame size={20} />
          <span className="rail-tooltip">Following</span>
        </button>

        {/* 4. Incident Rooms */}
        <button
          className={`rail-icon-btn ${activeView === 'incident_room' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('incident_room');
          }}
          title={`Incident Rooms (${activeRoomsCount} active)`}
          aria-label="Incident Rooms"
        >
          <DoorOpen size={20} />
          {activeRoomsCount > 0 && <span className="rail-badge">{activeRoomsCount}</span>}
          <span className="rail-tooltip">Incident Rooms</span>
        </button>

        {/* 5. Petitions & Tracking */}
        <button
          className={`rail-icon-btn ${activeView === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveView('tracking')}
          title="Petitions & Complaint Tracking"
          aria-label="Petitions & Tracking"
        >
          <FileText size={20} />
          <span className="rail-tooltip">Petitions & Tracking</span>
        </button>

        {/* 6. Notifications */}
        <button
          className={`rail-icon-btn ${activeView === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveView('notifications')}
          title={`Notifications (${unreadNotifsCount} unread)`}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadNotifsCount > 0 && <span className="rail-badge alert">{unreadNotifsCount}</span>}
          <span className="rail-tooltip">Notifications</span>
        </button>

        {/* 7. Saved Reports */}
        <button
          className="rail-icon-btn"
          onClick={() => {
            setActiveFeedTab('needs_attention');
            setActiveView('explore');
          }}
          title="Saved Reports"
          aria-label="Saved Reports"
        >
          <Bookmark size={20} />
          <span className="rail-tooltip">Saved Reports</span>
        </button>

        {/* 8. My Contributions */}
        <button
          className="rail-icon-btn"
          onClick={() => {
            setActiveFeedTab('unresolved');
            setActiveView('explore');
          }}
          title="My Contributions"
          aria-label="My Contributions"
        >
          <Briefcase size={20} />
          <span className="rail-tooltip">My Contributions</span>
        </button>

        {/* Divider */}
        <div className="rail-divider" />

        {/* 9. Profile / Persona */}
        <button
          className="rail-icon-btn"
          onClick={() => {
            const nextUser = DEMO_USERS.find((u) => u.id !== currentUser.id) || DEMO_USERS[0];
            setCurrentUser(nextUser);
          }}
          title={`Profile: ${currentUser.name} (${currentUser.role === 'community_leader' ? 'Leader' : 'Resident'}). Click to toggle.`}
          aria-label="User Profile"
        >
          <User size={20} />
          <span className="rail-tooltip">{currentUser.name}</span>
        </button>

        {/* 10. Settings / Location */}
        <button
          className="rail-icon-btn"
          onClick={() => setIsLocationModalOpen(true)}
          title="Change Location & Settings"
          aria-label="Location and Settings"
        >
          <Settings size={20} />
          <span className="rail-tooltip">Settings</span>
        </button>
      </nav>
    </aside>
  );
};
