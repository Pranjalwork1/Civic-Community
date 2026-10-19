import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  ChevronDown,
  X,
  Users,
  CheckCircle,
  RotateCcw,
  Crown,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DEMO_USERS } from '../../data/mockData';

export const DemoSimulationBar: React.FC = () => {
  const {
    incidents,
    rooms,
    campaigns,
    complaintDocs,
    simulateContributors,
    simulateRoomMembers,
    simulateAllSignatures,
    approveComplaintAsLeader,
    simulateSendComplaint,
    switchUser,
    currentUser,
    resetAllDemoData,
    setActiveView,
  } = useCivic();

  const [isOpen, setIsOpen] = useState(false);

  // Target default incident is CS-BSG-1042 (Pothole at BMSCE gate)
  const targetIncident = incidents.find((i) => i.id === 'inc-1042') || incidents[0];
  const targetRoom = rooms.find((r) => r.incidentId === targetIncident?.id) || rooms[0];
  const targetCampaign = targetRoom ? campaigns[targetRoom.id] : null;
  const targetComplaintKey = targetCampaign ? `doc-${targetRoom.id}-v${targetCampaign.complaintVersion}` : null;
  const targetComplaint = targetComplaintKey ? complaintDocs[targetComplaintKey] : null;

  return (
    <>
      {/* Collapsible Floating Trigger Button (Section 16: Never obscuring UI) */}
      <button
        className="dev-tools-fab-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Developer Simulation Tools (Demo Only)"
        aria-label="Developer Simulation Tools"
      >
        <Settings size={15} className={isOpen ? 'spin-anim' : ''} />
        <span>Dev Tools</span>
        <span className="dev-tools-mini-badge">DEMO</span>
      </button>

      {/* Popover Card (Displayed only when expanded) */}
      {isOpen && (
        <div className="dev-tools-popover-card">
          <div className="dev-tools-card-header">
            <div className="dev-tools-header-left">
              <span className="dev-tag-badge">DEMO / DEV ONLY</span>
              <span className="dev-header-title">Threshold Simulator</span>
            </div>
            <button
              className="dev-tools-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close Dev Panel"
            >
              <X size={15} />
            </button>
          </div>

          <div className="dev-tools-card-body">
            {/* Target Info */}
            <div className="dev-target-meta">
              Target: <strong>{targetIncident?.reference}</strong> ({targetIncident?.counts.uniqueContributors} contributors)
              {targetRoom && ` · Room: ${targetRoom.memberCount} members`}
            </div>

            {/* Test 6: 50 Contributors Threshold */}
            <div className="dev-section-group">
              <div className="dev-section-label">
                1. 50 Contributors (Unlocks Incident Room)
              </div>
              <div className="dev-btn-row">
                {[5, 19, 42, 49, 50].map((num) => (
                  <button
                    key={num}
                    className="dev-action-pill"
                    onClick={() => {
                      if (targetIncident) {
                        simulateContributors(targetIncident.id, num);
                      }
                    }}
                  >
                    Set {num} {num === 50 ? '🎉 (Trigger)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Test 7: 100 Room Members Threshold */}
            <div className="dev-section-group">
              <div className="dev-section-label">
                2. 100 Members (Unlocks Signature Campaign)
              </div>
              <div className="dev-btn-row">
                {[50, 75, 99, 100].map((num) => (
                  <button
                    key={num}
                    className="dev-action-pill"
                    disabled={!targetRoom}
                    style={{ opacity: targetRoom ? 1 : 0.4 }}
                    onClick={() => {
                      if (targetRoom) {
                        simulateRoomMembers(targetRoom.id, num);
                      } else {
                        alert('Trigger 50 contributors first to open an incident room!');
                      }
                    }}
                  >
                    Set {num} {num === 100 ? '🚀 (Start)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Test 8 & 9: Signatures & Leader Approval */}
            <div className="dev-section-group">
              <div className="dev-section-label">
                3. Collective Complaint & Leader Approval
              </div>
              <div className="dev-btn-row">
                <button
                  className="dev-action-pill"
                  disabled={!targetCampaign}
                  style={{ opacity: targetCampaign ? 1 : 0.4 }}
                  onClick={() => {
                    if (targetCampaign) {
                      simulateAllSignatures(targetCampaign.id);
                    }
                  }}
                >
                  ✓ Complete 100 Signatures
                </button>

                <button
                  className="dev-action-pill"
                  disabled={!targetComplaint}
                  style={{ opacity: targetComplaint ? 1 : 0.4 }}
                  onClick={() => {
                    if (targetComplaint) {
                      switchUser('user-ananya');
                      setActiveView('leader_approval');
                      setIsOpen(false);
                    }
                  }}
                >
                  👑 Leader Review Screen
                </button>
              </div>
            </div>

            {/* Switch Persona */}
            <div className="dev-section-group">
              <div className="dev-section-label">
                4. Active Persona: <span style={{ color: '#38bdf8' }}>{currentUser.name}</span>
              </div>
              <div className="dev-btn-row">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    className={`dev-action-pill ${currentUser.id === u.id ? 'active' : ''}`}
                    onClick={() => switchUser(u.id)}
                  >
                    {u.name} ({u.role === 'community_leader' ? 'Leader' : 'Resident'})
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <div className="dev-tools-footer">
              <button className="dev-reset-btn" onClick={resetAllDemoData}>
                <RotateCcw size={13} />
                <span>Reset Demo State to Baseline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
