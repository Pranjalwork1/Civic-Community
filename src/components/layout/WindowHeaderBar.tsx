import React from 'react';
import { ChevronLeft, ChevronRight, Lock, RotateCw, Share2, Compass, Shield } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const WindowHeaderBar: React.FC = () => {
  const { activeView, setActiveView, selectedLocation } = useCivic();

  const getPathSegment = () => {
    switch (activeView) {
      case 'explore':
        return selectedLocation ? `c/${selectedLocation.locality.toLowerCase().replace(/\s+/g, '-')}` : 'feed';
      case 'report_wizard':
        return 'report/new';
      case 'incident_detail':
        return 'incident/detail';
      case 'incident_room':
        return 'room/active';
      case 'complaint_doc':
        return 'complaint/document';
      case 'leader_approval':
        return 'complaint/leader-review';
      case 'tracking':
        return 'petitions/tracking';
      case 'notifications':
        return 'notifications';
      default:
        return 'explore';
    }
  };

  return (
    <div className="window-header-bar">
      {/* Window Controls (Mac/iPad style matching reference image) */}
      <div className="window-header-left">
        <div className="window-dots-group">
          <span className="window-dot dot-close" />
          <span className="window-dot dot-minimize" />
          <span className="window-dot dot-expand" />
        </div>

        <div className="window-nav-arrows">
          <button
            className="window-nav-arrow"
            onClick={() => setActiveView('explore')}
            title="Navigate Back to Feed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="window-nav-arrow"
            onClick={() => {}}
            title="Navigate Forward"
            disabled
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Center Simulated URL Pill */}
      <div className="window-url-pill">
        <Lock size={12} className="url-lock-icon" />
        <span className="url-domain">civicsignal.community</span>
        <span className="url-slash">/</span>
        <span className="url-path">{getPathSegment()}</span>
        <button
          className="url-refresh-btn"
          onClick={() => window.location.reload()}
          title="Reload Application"
        >
          <RotateCw size={11} />
        </button>
      </div>

      {/* Right Controls */}
      <div className="window-header-right">
        <div className="window-status-badge">
          <span className="window-status-dot" />
          <span>Live Civic Mesh</span>
        </div>
      </div>
    </div>
  );
};
