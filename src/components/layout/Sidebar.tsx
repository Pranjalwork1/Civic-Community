import React from 'react';
import {
  Compass,
  MapPin,
  Users,
  MessagesSquare,
  BookmarkCheck,
  Award,
  Bookmark,
  FileText,
  Bell,
  User,
  Settings,
  PlusCircle,
  LayoutGrid,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    rooms,
    incidents,
    currentUser,
    notifications,
    resetDraft,
    setWizardStep,
    selectedLocation,
    setIsLocationModalOpen,
  } = useCivic();

  const activeRoomsCount = rooms.length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleStartReport = () => {
    resetDraft();
    setWizardStep(1);
    setActiveView('report_wizard');
  };

  return (
    <aside className="left-sidebar">
      <div className="sidebar-nav-section">
        <div className="sidebar-heading">
          <span>FEEDS</span>
          <Compass size={13} />
        </div>

        <button
          className={`sidebar-nav-item ${activeView === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveView('explore')}
        >
          <Compass size={18} />
          <span>Home Feed</span>
        </button>

        <button
          className={`sidebar-nav-item`}
          onClick={() => setActiveView('explore')}
        >
          <MapPin size={18} />
          <span>Nearby Radar</span>
        </button>

        <button
          className={`sidebar-nav-item`}
          onClick={() => setActiveView('explore')}
        >
          <BookmarkCheck size={18} />
          <span>Following</span>
        </button>

        <div className="sidebar-heading" style={{ marginTop: '12px' }}>
          <span>CIVIC WORKSPACES</span>
          <LayoutGrid size={13} />
        </div>

        <button
          className={`sidebar-nav-item ${activeView === 'incident_room' ? 'active' : ''}`}
          onClick={() => {
            if (rooms.length > 0) {
              setActiveView('incident_room');
            } else {
              alert('Incident Rooms unlock when 50 unique neighbors corroborate an issue! Try simulating 50 contributors on the BMSCE college gate pothole issue.');
            }
          }}
        >
          <MessagesSquare size={18} />
          <span>Incident Rooms</span>
          {activeRoomsCount > 0 && <span className="badge-count">{activeRoomsCount}</span>}
        </button>

        <button
          className={`sidebar-nav-item ${activeView === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveView('tracking')}
        >
          <FileText size={18} />
          <span>Petitions & Tracking</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeView === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveView('notifications')}
        >
          <Bell size={18} />
          <span>Notifications</span>
          {unreadNotifsCount > 0 && <span className="badge-count">{unreadNotifsCount}</span>}
        </button>

        <button
          className={`sidebar-nav-item`}
          onClick={() => setActiveView('explore')}
        >
          <Bookmark size={18} />
          <span>Saved Reports</span>
        </button>
      </div>

      {/* Community Card (Dynamic) */}
      <div className="sidebar-community-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="community-name-title">
              {selectedLocation ? selectedLocation.locality : 'Local Community'}
            </div>
            <div className="community-submeta">
              {selectedLocation
                ? `${selectedLocation.city} · ${selectedLocation.source === 'sample' ? 'Demo Area' : 'Selected Area'}`
                : 'Choose your location'}
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            style={{ fontSize: '11px', color: '#ff4500', fontWeight: 600, padding: '2px 4px' }}
            title="Change browsing area"
          >
            Change
          </button>
        </div>
        <div className="community-tagline-quote">
          "Your community. One voice. Real civic action."
        </div>

        <button className="sidebar-report-btn" onClick={handleStartReport}>
          Report a Civic Issue
        </button>

        <div className="sidebar-footer-links">
          <span>Community guidelines · Privacy</span>
          <span>Civic signal records</span>
        </div>
      </div>
    </aside>
  );
};
