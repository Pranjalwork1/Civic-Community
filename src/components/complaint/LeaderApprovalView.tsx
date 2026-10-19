import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  ArrowLeft,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const LeaderApprovalView: React.FC = () => {
  const {
    complaintDocs,
    rooms,
    activeRoom,
    campaigns,
    approveComplaintAsLeader,
    simulateSendComplaint,
    setActiveView,
    currentUser,
  } = useCivic();

  const [notes, setNotes] = useState('');
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);

  const currentRoom = activeRoom || rooms[0];
  const campaign = currentRoom ? campaigns[currentRoom.id] : null;
  const complaintKey = campaign ? `doc-${currentRoom.id}-v${campaign.complaintVersion}` : null;
  const complaint = complaintKey ? complaintDocs[complaintKey] : Object.values(complaintDocs)[0];

  if (!complaint) {
    return (
      <div className="center-content">
        <div className="detail-page-container" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>No Complaint Pending Leader Review</h2>
          <button className="btn-wizard-back" onClick={() => setActiveView('explore')} style={{ marginTop: '16px' }}>
            ← Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const isLeader = currentUser.role === 'community_leader' || currentUser.name === 'Ananya Sharma';

  const handleApprove = () => {
    approveComplaintAsLeader(complaint.id, 'approved', 'Approved by initial verified reporter Ananya Sharma');
    // Also trigger simulated send
    simulateSendComplaint(complaint.id);
  };

  const handleRequestChanges = () => {
    if (!notes.trim()) {
      alert('Please specify the requested changes for the community draft.');
      return;
    }
    approveComplaintAsLeader(complaint.id, 'changes_requested', notes);
    setIsChangesModalOpen(false);
  };

  return (
    <div className="center-content">
      <div className="detail-page-container">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0284c7',
            }}
            onClick={() => setActiveView('incident_room')}
          >
            <ArrowLeft size={16} />
            <span>Back to Incident Room</span>
          </button>

          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor:
                complaint.status === 'simulated_send_completed'
                  ? '#dcfce7'
                  : complaint.status === 'approved_for_send'
                  ? '#eff6ff'
                  : '#fffbeb',
              color:
                complaint.status === 'simulated_send_completed'
                  ? '#15803d'
                  : complaint.status === 'approved_for_send'
                  ? '#1d70b8'
                  : '#b45309',
            }}
          >
            {complaint.status === 'simulated_send_completed'
              ? '✓ Simulated Send Completed'
              : complaint.status === 'approved_for_send'
              ? 'Approved for Transmission'
              : 'Awaiting Community Leader Approval'}
          </span>
        </div>

        {/* Banner with Leader Authorization */}
        <div
          style={{
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#7c3aed',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Crown size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#581c87' }}>
              Community Leader Review & Authorization Gate
            </div>
            <div style={{ fontSize: '12px', color: '#7e22ce', marginTop: '2px' }}>
              Initial Leader: <strong>Ananya Sharma</strong> (Earliest Verified Reporter) · Current Active Persona:{' '}
              <strong>{currentUser.name}</strong> ({isLeader ? 'Authorized Leader' : 'Resident Observer'})
            </div>
          </div>
        </div>

        {/* Warning if not leader */}
        {!isLeader && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            ⚠️ You are currently viewing as <strong>{currentUser.name}</strong>. Switch to{' '}
            <strong>Ananya Sharma</strong> using the top-right persona menu or the demo toolbar to execute
            Leader Authorization.
          </div>
        )}

        {/* Simulated Send Success Banner (If completed) */}
        {complaint.status === 'simulated_send_completed' && complaint.simulatedSendResult && (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 800, fontSize: '15px' }}>
              <CheckCircle2 size={18} />
              <span>Simulated Transmission Successful</span>
            </div>
            <div style={{ fontSize: '13px', color: '#166534', marginTop: '6px' }}>
              Complaint v{complaint.version} dispatched to: <strong>{complaint.simulatedSendResult.dispatchedTo}</strong>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#14532d', marginTop: '4px' }}>
              Tracking Identifier: <strong>{complaint.simulatedSendResult.trackingCode}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#475467', marginTop: '6px' }}>
              {complaint.simulatedSendResult.message}
            </div>
          </div>
        )}

        {/* Review Metadata Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div style={{ padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Recipient Authority
            </div>
            <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>
              {complaint.recipient.name}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{complaint.recipient.department}</div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Campaign Consent Status
            </div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#15803d', marginTop: '2px' }}>
              {complaint.signatories.length} Verified Signatures Attached
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Draft Version v{complaint.version} locked for transmission
            </div>
          </div>
        </div>

        {/* Complaint Preview Accordion */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
            Subject: {complaint.subject}
          </div>
          <div style={{ fontSize: '13px', color: '#475467', lineHeight: 1.5, marginBottom: '12px' }}>
            {complaint.description}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Reviewed Location: <strong>{complaint.reviewedLocation.name}</strong> ({complaint.reviewedLocation.coordinates})
          </div>
        </div>

        {/* Leader Action Buttons */}
        {complaint.status !== 'simulated_send_completed' && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                backgroundColor: '#fff',
              }}
              onClick={() => setIsChangesModalOpen(true)}
              disabled={!isLeader}
            >
              Request Changes
            </button>

            <button
              style={{
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                borderRadius: '6px',
                backgroundColor: isLeader ? '#15803d' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: isLeader ? 'pointer' : 'not-allowed',
              }}
              onClick={handleApprove}
              disabled={!isLeader}
            >
              <ShieldCheck size={16} />
              <span>Approve & Simulate Send</span>
            </button>
          </div>
        )}

        {/* Changes Modal */}
        {isChangesModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '480px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>
                Request Changes to Complaint Draft
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                Explain what needs correction. Requesting changes will return the draft to the community workspace.
              </p>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="e.g. Include additional peak hour traffic photograph from opposite side of street..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  onClick={() => setIsChangesModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#b91c1c',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                  onClick={handleRequestChanges}
                >
                  Submit Change Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
