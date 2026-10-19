import React, { useState } from 'react';
import {
  MessagesSquare,
  Users,
  Camera,
  Clock,
  FileText,
  Pin,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  ArrowRight,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { SAMPLE_IMAGES } from '../../data/mockData';

export const IncidentRoomView: React.FC = () => {
  const {
    rooms,
    activeRoom,
    setActiveRoomId,
    roomMessages,
    sendMessageToRoom,
    campaigns,
    complaintDocs,
    signCampaignDecision,
    setActiveView,
    currentUser,
    simulateRoomMembers,
    simulateAllSignatures,
  } = useCivic();

  const [activeTab, setActiveTab] = useState<'discussion' | 'evidence' | 'timeline' | 'complaint' | 'members'>('discussion');
  const [inputText, setInputText] = useState('');

  // Fallback to first room if activeRoom is not set
  const currentRoom = activeRoom || rooms[0];

  if (!currentRoom) {
    return (
      <div className="center-content">
        <div className="detail-page-container" style={{ textAlign: 'center', padding: '40px' }}>
          <MessagesSquare size={48} color="#0284c7" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            No Incident Rooms Active Yet
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px' }}>
            When an incident gathers 50 unique eligible contributors, a dedicated community incident
            room opens automatically with the earliest verified reporter as Community Leader.
          </p>
          <button
            style={{
              backgroundColor: '#0284c7',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              padding: '10px 20px',
              borderRadius: '8px',
            }}
            onClick={() => setActiveView('explore')}
          >
            Go to Explore & Simulate 50 Contributors
          </button>
        </div>
      </div>
    );
  }

  const messages = roomMessages[currentRoom.id] || [];
  const campaign = campaigns[currentRoom.id];
  const complaintKey = campaign ? `doc-${currentRoom.id}-v${campaign.complaintVersion}` : null;
  const complaint = complaintKey ? complaintDocs[complaintKey] : null;

  const currentMemberRecord = currentRoom.members.find((m) => m.id === currentUser.id);
  const userSignatureDecision = campaign
    ? campaign.signedMembers.includes(currentUser.id)
      ? 'signed'
      : campaign.declinedMembers.includes(currentUser.id)
      ? 'declined'
      : 'pending'
    : 'pending';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessageToRoom(currentRoom.id, inputText.trim());
    setInputText('');
  };

  const handleSign = () => {
    if (!campaign) return;
    signCampaignDecision(campaign.id, currentUser.id, 'signed');
  };

  const handleDecline = () => {
    if (!campaign) return;
    signCampaignDecision(campaign.id, currentUser.id, 'declined');
  };

  return (
    <div className="center-content">
      {/* Room Header Box (Exact Figma Phase 2 Workspace) */}
      <div className="room-header-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <span className="category-tag">{currentRoom.category}</span>
              <span className="status-pill status-room-active">● Active Community Workspace</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Ref: <strong>{currentRoom.incidentReference}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              {currentRoom.title}
            </h1>
            <div style={{ fontSize: '13px', color: '#475467', marginTop: '2px' }}>
              📍 {currentRoom.location}
            </div>
          </div>

          {/* Action button if campaign ready for approval */}
          {complaint && complaint.status === 'awaiting_leader_approval' && (
            <button
              style={{
                backgroundColor: '#15803d',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setActiveView('leader_approval')}
            >
              <span>Leader Approval Ready</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Community Leader Card & Membership Progress */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#7c3aed',
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentRoom.leader.avatar}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                  {currentRoom.leader.name}
                </span>
                <span className="leader-badge-pill">Community Leader</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Earliest verified original reporter · Basavanagudi resident
              </div>
            </div>
          </div>

          {/* Threshold 100 Progress towards Signature Campaign */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              <span>Signature Campaign Goal</span>
              <span>
                <strong>{currentRoom.memberCount}</strong> / 100 members
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, (currentRoom.memberCount / 100) * 100)}%`,
                  background: 'linear-gradient(90deg, #7c3aed 0%, #0284c7 100%)',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {currentRoom.memberCount >= 100
                ? '✓ 100 members reached — Signature Campaign Active'
                : `${100 - currentRoom.memberCount} more room members to initiate collective signature campaign.`}
            </div>
          </div>
        </div>

        {/* Signature Campaign Banner (If 100 members reached) */}
        {campaign && (
          <div
            style={{
              marginTop: '14px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} />
                  <span>Collective Signature Campaign in Progress (Draft v{campaign.complaintVersion})</span>
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                  Intended Recipient: <strong>{complaint?.recipient.name}</strong> ·{' '}
                  {campaign.signedMembers.length} signed, {campaign.declinedMembers.length} declined,{' '}
                  {campaign.pendingMembers.length} pending
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    backgroundColor: userSignatureDecision === 'signed' ? '#15803d' : '#0284c7',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={handleSign}
                >
                  <CheckCircle2 size={13} />
                  <span>{userSignatureDecision === 'signed' ? 'Signed ✓' : 'Sign Complaint'}</span>
                </button>

                <button
                  style={{
                    backgroundColor: userSignatureDecision === 'declined' ? '#b91c1c' : '#fff',
                    color: userSignatureDecision === 'declined' ? '#fff' : '#64748b',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '6px',
                  }}
                  onClick={handleDecline}
                >
                  {userSignatureDecision === 'declined' ? 'Declined' : 'Decline'}
                </button>

                <button
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0284c7',
                    padding: '6px 10px',
                  }}
                  onClick={() => setActiveTab('complaint')}
                >
                  View Full Draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="room-tabs-nav">
        {[
          { id: 'discussion', label: `Discussion (${messages.length})`, icon: MessagesSquare },
          { id: 'evidence', label: 'Evidence Gallery', icon: Camera },
          { id: 'timeline', label: 'Incident Timeline', icon: Clock },
          { id: 'complaint', label: 'Complaint Document', icon: FileText },
          { id: 'members', label: `Members (${currentRoom.members.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`room-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={15} />
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DISCUSSION */}
      {activeTab === 'discussion' && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div className="chat-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className="chat-message-bubble">
                <div
                  className="chat-avatar"
                  style={{
                    backgroundColor: msg.author.isAi ? '#0f172a' : msg.author.isLeader ? '#7c3aed' : '#0284c7',
                  }}
                >
                  {msg.author.avatar}
                </div>
                <div className="chat-message-content">
                  <div className="chat-author-line">
                    <span className="chat-author-name">{msg.author.name}</span>
                    {msg.author.isLeader && <span className="leader-badge-pill">Community Leader</span>}
                    {msg.author.isAi && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#0f172a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        SYSTEM
                      </span>
                    )}
                    {msg.isPinned && (
                      <span style={{ fontSize: '11px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Pin size={11} />
                        <span>Pinned</span>
                      </span>
                    )}
                    <span className="chat-time">{msg.timestamp}</span>
                  </div>

                  <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                    {msg.content}
                  </div>

                  {msg.replies && msg.replies.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                      {msg.replies.map((r) => (
                        <div key={r.id} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.author.name}:</span>
                          <span style={{ color: '#475467' }}>{r.content}</span>
                          <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: 'auto' }}>
                            {r.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <input
              type="text"
              className="chat-text-input"
              placeholder={`Message room as ${currentUser.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Community-Corroborated Evidence Archive
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <img
                src={SAMPLE_IMAGES.pothole}
                alt="Evidence"
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '10px', fontSize: '12px' }}>
                <div style={{ fontWeight: 700 }}>IMG_1042.jpg</div>
                <div style={{ color: '#64748b' }}>Submitted by Ananya Sharma (Original)</div>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>12 Oct 2026, 08:40 IST</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Incident Lifecycle History
          </h3>
          <div className="timeline-feed">
            <div className="timeline-item-row">
              <div className="timeline-dot">
                <Users size={16} />
              </div>
              <div className="timeline-content-box">
                <div className="timeline-title">Incident Room Opened at 50 Contributors</div>
                <div className="timeline-desc">
                  Ananya Sharma appointed Community Leader. Dedicated workspace activated.
                </div>
                <div className="timeline-meta-sub">Today · System Automation</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLAINT DOCUMENT */}
      {activeTab === 'complaint' && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
              Complaint Document Draft (v{campaign?.complaintVersion || 1})
            </h3>
            <button
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '6px',
              }}
              onClick={() => setActiveView('complaint_doc')}
            >
              Open Printable Document Sheet ↗
            </button>
          </div>

          {complaint ? (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#fcfcfc', fontFamily: 'serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>FORMAL RESIDENT GRIEVANCE</h2>
                <div style={{ fontSize: '12px', color: '#555' }}>Basavanagudi Community Action Network</div>
              </div>

              <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                <div><strong>TO:</strong> {complaint.recipient.name}</div>
                <div><strong>DEPARTMENT:</strong> {complaint.recipient.department}</div>
                <div><strong>SUBJECT:</strong> {complaint.subject}</div>
                <div style={{ marginTop: '12px' }}><strong>LOCATION:</strong> {complaint.reviewedLocation.name} ({complaint.reviewedLocation.coordinates})</div>
                <div style={{ marginTop: '12px' }}><strong>COMMUNITY IMPACT:</strong> {complaint.communityImpact}</div>
                <div style={{ marginTop: '12px' }}><strong>REQUESTED CORRECTIVE ACTION:</strong></div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px' }}>{complaint.requestedAction}</pre>

                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '12px' }}>
                  <strong>CERTIFIED RESIDENT SIGNATORIES ({complaint.signatories.length}):</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                    {complaint.signatories.length === 0 ? (
                      <div style={{ color: '#888', fontStyle: 'italic' }}>
                        No signatures recorded yet. Eligible members can sign using the banner above.
                      </div>
                    ) : (
                      complaint.signatories.map((s, idx) => (
                        <div key={idx} style={{ fontSize: '12px', padding: '4px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
                          ✓ {s.name} ({s.timestamp})
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Complaint draft will be prepared automatically when the room reaches 100 members.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MEMBERS */}
      {activeTab === 'members' && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
              Room Membership Directory ({currentRoom.members.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Requires 100 eligible members for signature campaign
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentRoom.members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  border: '1px solid #f1f5f9',
                  borderRadius: '8px',
                  backgroundColor: m.role === 'leader' ? '#fdf4ff' : '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: m.role === 'leader' ? '#7c3aed' : '#0284c7',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {m.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>
                      {m.name} {m.id === currentUser.id && '(You)'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Joined {m.joinedAt}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {m.role === 'leader' ? (
                    <span className="leader-badge-pill">Community Leader</span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Member</span>
                  )}

                  {campaign && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          campaign.signedMembers.includes(m.id)
                            ? '#dcfce7'
                            : campaign.declinedMembers.includes(m.id)
                            ? '#fee2e2'
                            : '#f1f5f9',
                        color:
                          campaign.signedMembers.includes(m.id)
                            ? '#15803d'
                            : campaign.declinedMembers.includes(m.id)
                            ? '#b91c1c'
                            : '#64748b',
                      }}
                    >
                      {campaign.signedMembers.includes(m.id)
                        ? 'Signed'
                        : campaign.declinedMembers.includes(m.id)
                        ? 'Declined'
                        : 'Pending'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
