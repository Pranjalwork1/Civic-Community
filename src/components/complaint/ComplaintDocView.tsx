import React from 'react';
import {
  Printer,
  ArrowLeft,
  Shield,
  FileCheck,
  CheckCircle,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const ComplaintDocView: React.FC = () => {
  const {
    complaintDocs,
    rooms,
    activeRoom,
    campaigns,
    setActiveView,
    currentUser,
  } = useCivic();

  const currentRoom = activeRoom || rooms[0];
  const campaign = currentRoom ? campaigns[currentRoom.id] : null;
  const complaintKey = campaign ? `doc-${currentRoom.id}-v${campaign.complaintVersion}` : null;
  const complaint = complaintKey ? complaintDocs[complaintKey] : Object.values(complaintDocs)[0];

  if (!complaint) {
    return (
      <div className="center-content">
        <div className="detail-page-container" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>No Complaint Document Generated Yet</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 16px' }}>
            Complaint documents are prepared automatically when an incident room initiates a collective signature campaign.
          </p>
          <button className="btn-wizard-back" onClick={() => setActiveView('explore')}>
            ← Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="center-content">
      {/* Top Nav */}
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '13px',
              fontWeight: 600,
            }}
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print / Export PDF</span>
          </button>

          {complaint.status === 'awaiting_leader_approval' && (
            <button
              style={{
                backgroundColor: '#15803d',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setActiveView('leader_approval')}
            >
              <Crown size={15} />
              <span>Proceed to Leader Approval</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Formatted Sheet */}
      <div className="complaint-document-sheet">
        <div className="complaint-header-seal">
          <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475467' }}>
            CIVICSIGNAL COMMUNITY ADVOCACY NETWORK · BASAVANAGUDI WARD 154
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '6px 0 2px' }}>
            FORMAL PETITION & CIVIC GRIEVANCE NOTICE
          </h1>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Document Reference: CIVIC-PETITION-2026-v{complaint.version} · Date of Generation: 12 October 2026
          </div>
        </div>

        {/* Recipient Authority */}
        <div style={{ marginBottom: '18px' }}>
          <div className="doc-section-title">ADDRESSED TO RESPONSIBLE PUBLIC AUTHORITY</div>
          <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
            <strong>{complaint.recipient.name}</strong><br />
            {complaint.recipient.department}<br />
            {complaint.recipient.address}<br />
            <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              (Routing verified from CivicSignal Local Public Authorities Directory)
            </span>
          </div>
        </div>

        {/* Subject & Summary */}
        <div style={{ marginBottom: '18px' }}>
          <div className="doc-section-title">SUBJECT</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>
            {complaint.subject}
          </div>
        </div>

        {/* Location & Landmark */}
        <div style={{ marginBottom: '18px' }}>
          <div className="doc-section-title">INCIDENT LOCATION & ACCURACY DATA</div>
          <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
            <strong>Specific Site:</strong> {complaint.reviewedLocation.name}<br />
            <strong>Reviewed Coordinates:</strong> {complaint.reviewedLocation.coordinates}<br />
            <strong>Nearest Landmark:</strong> {complaint.reviewedLocation.landmark}
          </div>
        </div>

        {/* Incident Description */}
        <div style={{ marginBottom: '18px' }}>
          <div className="doc-section-title">DETAILED OBSERVATION RECORD</div>
          <div style={{ fontSize: '14px', lineHeight: 1.6, textAlign: 'justify' }}>
            {complaint.description}
          </div>
        </div>

        {/* Community Impact */}
        <div style={{ marginBottom: '18px' }}>
          <div className="doc-section-title">COMMUNITY IMPACT & RISK ASSESSMENT</div>
          <div style={{ fontSize: '14px', lineHeight: 1.6, textAlign: 'justify' }}>
            {complaint.communityImpact}
          </div>
        </div>

        {/* Evidence Index */}
        <div style={{ marginBottom: '18px' }}>
          <div className="doc-section-title">SUPPORTING EVIDENCE INDEX</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '6px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '6px 0' }}>Item Reference</th>
                <th>Contributor</th>
                <th>Capture Timestamp</th>
                <th>Evidence Status</th>
              </tr>
            </thead>
            <tbody>
              {complaint.evidenceIndex.map((ev, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px 0', fontFamily: 'monospace' }}>{ev.name}</td>
                  <td>{ev.contributor}</td>
                  <td>{ev.date}</td>
                  <td style={{ color: '#15803d' }}>Verified Original Retained</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Requested Action */}
        <div style={{ marginBottom: '22px' }}>
          <div className="doc-section-title">REQUESTED CORRECTIVE ACTION</div>
          <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {complaint.requestedAction}
          </div>
        </div>

        {/* Actual Certified Signatories (Strict consent requirement) */}
        <div style={{ marginBottom: '24px' }}>
          <div className="doc-section-title">
            CERTIFIED COMMUNITY SIGNATORIES ({complaint.signatories.length} RESIDENTS)
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
            Each signatory below has reviewed this exact draft (v{complaint.version}) and granted explicit in-app endorsement. Unconfirmed members and declined responses are strictly omitted.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
            {complaint.signatories.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '13px' }}>
                No verified signatures recorded on this draft version yet.
              </div>
            ) : (
              complaint.signatories.map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#15803d' }}>✓ {sig.name}</div>
                  <div style={{ fontSize: '10px', color: '#475467' }}>
                    Signed {sig.timestamp} · v{sig.version}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prototype Legal Disclaimer */}
        <div
          style={{
            borderTop: '2px solid #334155',
            paddingTop: '12px',
            fontSize: '11px',
            color: '#64748b',
            lineHeight: 1.4,
          }}
        >
          <strong>PROTOTYPE DISCLAIMER:</strong> This is a civic complaint document generated within the
          CivicSignal Phase 2 Interactive Prototype. Submission is simulated for stakeholder demonstration.
          No actual automated email or official legal summons has been transmitted.
        </div>
      </div>
    </div>
  );
};
