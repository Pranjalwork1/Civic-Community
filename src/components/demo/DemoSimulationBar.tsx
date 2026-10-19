import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Users,
  CheckCircle,
  RotateCcw,
  Crown,
  FileCheck,
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
    <div className="demo-toolbar-floating">
      <div className="demo-toolbar-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#38bdf8" />
          <span>Dev Simulation Panel (Thresholds & Tests)</span>
        </div>
        <button style={{ color: '#94a3b8' }}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Active Target State */}
          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
            Target: <strong>{targetIncident?.reference}</strong> ({targetIncident?.counts.uniqueContributors} contributors)
            {targetRoom && ` · Room: ${targetRoom.memberCount} members`}
          </div>

          {/* Test 6: 50 Contributors Threshold Simulator */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
              1. Incident Contributors (50 Threshold → Open Room)
            </div>
            <div className="demo-btn-group">
              {[5, 19, 42, 49, 50].map((num) => (
                <button
                  key={num}
                  className="btn-demo-action"
                  onClick={() => {
                    if (targetIncident) {
                      simulateContributors(targetIncident.id, num);
                    }
                  }}
                >
                  Set {num} {num === 50 ? '🎉 (Trigger Room)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Test 7: 100 Room Members Threshold Simulator */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
              2. Room Members (100 Threshold → Signature Campaign)
            </div>
            <div className="demo-btn-group">
              {[50, 75, 99, 100].map((num) => (
                <button
                  key={num}
                  className="btn-demo-action"
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
                  Set {num} Members {num === 100 ? '🚀 (Start Campaign)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Test 8 & 9: Signatures & Leader Approval */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
              3. Signatures & Leader Approval Workflow
            </div>
            <div className="demo-btn-group">
              <button
                className="btn-demo-action"
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
                className="btn-demo-action"
                disabled={!targetComplaint}
                style={{ opacity: targetComplaint ? 1 : 0.4 }}
                onClick={() => {
                  if (targetComplaint) {
                    switchUser('user-ananya');
                    setActiveView('leader_approval');
                  }
                }}
              >
                👑 Jump to Leader Approval
              </button>
            </div>
          </div>

          {/* Persona Switcher */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
              4. Active Persona: <span style={{ color: '#38bdf8' }}>{currentUser.name}</span>
            </div>
            <div className="demo-btn-group">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  className="btn-demo-action"
                  style={{
                    backgroundColor: currentUser.id === u.id ? '#0284c7' : '#1e293b',
                    color: currentUser.id === u.id ? '#fff' : '#cbd5e1',
                  }}
                  onClick={() => switchUser(u.id)}
                >
                  {u.name} ({u.role === 'community_leader' ? 'Leader' : 'Resident'})
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <div style={{ borderTop: '1px solid #334155', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#f87171',
                fontSize: '11px',
                fontWeight: 600,
              }}
              onClick={resetAllDemoData}
            >
              <RotateCcw size={13} />
              <span>Reset State to Figma Baseline</span>
            </button>
            <span style={{ fontSize: '10px', color: '#64748b' }}>Phase 2 Prototype</span>
          </div>
        </div>
      )}
    </div>
  );
};
