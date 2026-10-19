import React from 'react';
import { AlertTriangle, CheckCircle2, Shield, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const FloatingSideWidgets: React.FC = () => {
  const { selectedLocation, setActiveView, setCurrentIncidentId, incidents } = useCivic();

  const activeHazard = incidents.find((i) => i.severity === 'high' || i.categoryId === 'roads_footpaths') || incidents[0];
  const resolvedSample = incidents.find((i) => i.status === 'resolved') || incidents[2];

  return (
    <>
      {/* Left Floating Contextual Preview Widget */}
      <aside className="floating-companion-card left-companion" aria-label="Nearby Community Alert">
        <div className="floating-card-header">
          <div className="floating-tag-badge alert-tag">
            <AlertTriangle size={12} />
            <span>Nearby Alert</span>
          </div>
          <span className="floating-card-meta">Live Radar</span>
        </div>

        <div className="floating-card-body">
          <div className="floating-card-locality">
            c/{selectedLocation ? selectedLocation.locality : 'Basavanagudi'}
          </div>
          <h4 className="floating-card-title">
            {activeHazard?.title || 'Dangerous pothole near main gate'}
          </h4>
          <p className="floating-card-desc">
            32 neighbors corroborated this spot today.
          </p>

          <div className="floating-card-footer">
            <span className="floating-stat-pill">
              <MapPin size={11} />
              <span>350 m away</span>
            </span>
            <button
              className="floating-action-link"
              onClick={() => {
                if (activeHazard) {
                  setCurrentIncidentId(activeHazard.id);
                  setActiveView('incident_detail');
                }
              }}
            >
              <span>View</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Right Floating Contextual Preview Widget */}
      <aside className="floating-companion-card right-companion" aria-label="Community Resolution Update">
        <div className="floating-card-header">
          <div className="floating-tag-badge resolved-tag">
            <CheckCircle2 size={12} />
            <span>Community Fix</span>
          </div>
          <span className="floating-card-meta">42 resolved</span>
        </div>

        <div className="floating-card-body">
          <div className="floating-card-locality">Verified Citizen Action</div>
          <h4 className="floating-card-title">
            {resolvedSample?.title || 'Drain cover replaced on K.R. Road'}
          </h4>
          <p className="floating-card-desc">
            Petition signed by 100 members and resolved by ward engineers.
          </p>

          <div className="floating-card-footer">
            <span className="floating-stat-pill success">
              <Users size={11} />
              <span>100 Signatures</span>
            </span>
            <button
              className="floating-action-link"
              onClick={() => {
                setActiveView('explore');
              }}
            >
              <span>Feed</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
