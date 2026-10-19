import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Send,
  Users,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const ComplaintTrackingView: React.FC = () => {
  const {
    incidents,
    rooms,
    campaigns,
    complaintDocs,
    setActiveView,
    setCurrentIncidentId,
  } = useCivic();

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'room_active') return inc.status === 'room_active';
    if (statusFilter === 'simulated_send_completed') return inc.status === 'simulated_send_completed';
    return inc.status === statusFilter;
  });

  return (
    <div className="center-content">
      <div className="detail-page-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              Complaint & Incident Tracking
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Track citizen reports, collective campaigns, and simulated municipal transmissions.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#64748b" />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Lifecycles</option>
              <option value="active_unresolved">Evidence Gathering</option>
              <option value="room_active">Incident Room Open</option>
              <option value="simulated_send_completed">Simulated Send Completed</option>
            </select>
          </div>
        </div>

        {/* Incidents Table / Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredIncidents.map((inc) => {
            const room = rooms.find((r) => r.incidentId === inc.id);
            const campaign = room ? campaigns[room.id] : null;
            const complaintKey = room && campaign ? `doc-${room.id}-v${campaign.complaintVersion}` : null;
            const complaint = complaintKey ? complaintDocs[complaintKey] : null;

            const isSubmitted = inc.status === 'simulated_send_completed';
            const isRoomOpen = !!room;

            return (
              <div
                key={inc.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  backgroundColor: '#fff',
                  transition: 'border-color 150ms ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="category-tag">{inc.category}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: isSubmitted
                            ? '#dcfce7'
                            : isRoomOpen
                            ? '#ede9fe'
                            : '#fef3c7',
                          color: isSubmitted
                            ? '#166534'
                            : isRoomOpen
                            ? '#6b21a8'
                            : '#92400e',
                        }}
                      >
                        {isSubmitted
                          ? 'Simulated Send Completed'
                          : isRoomOpen
                          ? 'Incident Room Active'
                          : 'Evidence Gathering (Below 50)'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Ref: <strong>{inc.reference}</strong>
                      </span>
                    </div>

                    <h3
                      style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                      onClick={() => {
                        setCurrentIncidentId(inc.id);
                        setActiveView('incident_detail');
                      }}
                    >
                      {inc.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      📍 {inc.landmark} · {inc.locality}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => {
                        setCurrentIncidentId(inc.id);
                        setActiveView('incident_detail');
                      }}
                    >
                      <span>Track Details</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                    backgroundColor: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginTop: '10px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b' }}>Contributors: </span>
                    <strong>{inc.counts.uniqueContributors} / 50</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Room Members: </span>
                    <strong>{room ? room.memberCount : '0'} / 100</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Signatures: </span>
                    <strong>{campaign ? campaign.signedMembers.length : 0}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Next Step: </span>
                    <strong style={{ color: '#0284c7' }}>
                      {isSubmitted
                        ? 'Awaiting Ward Engineer Review'
                        : campaign
                        ? 'Signatures / Leader Approval'
                        : isRoomOpen
                        ? '100 Members for Campaign'
                        : 'Gather 50 Contributors'}
                    </strong>
                  </div>
                </div>

                {/* Simulated Dispatch Code if completed */}
                {complaint && complaint.simulatedSendResult && (
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '11px',
                      color: '#15803d',
                      backgroundColor: '#f0fdf4',
                      padding: '6px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    ✓ Simulated Transmission Code:{' '}
                    <strong>{complaint.simulatedSendResult.trackingCode}</strong> (Dispatched to{' '}
                    {complaint.recipient.name})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
