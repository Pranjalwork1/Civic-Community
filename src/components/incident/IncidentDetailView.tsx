import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Camera,
  Eye,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  GitMerge,
  MessagesSquare,
  Shield,
  ThumbsUp,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { EvidenceItem } from '../../types';
import { SAMPLE_IMAGES } from '../../data/mockData';

export const IncidentDetailView: React.FC = () => {
  const {
    currentIncident,
    setActiveView,
    toggleGesture,
    timelineEvents,
    setConsolidationTargetIncident,
    setIsConsolidationModalOpen,
    currentUser,
    simulateContributors,
  } = useCivic();

  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'timeline'>('overview');
  const [evidenceViewMode, setEvidenceViewMode] = useState<'geotagged' | 'original'>('geotagged');

  if (!currentIncident) {
    return (
      <div className="center-content">
        <div className="detail-page-container">
          <button className="btn-wizard-back" onClick={() => setActiveView('explore')}>
            ← Back to Explore
          </button>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#64748b' }}>
            Incident not found or no incident selected.
          </div>
        </div>
      </div>
    );
  }

  const timeline = timelineEvents[currentIncident.id] || [];
  const isRoomActive = currentIncident.counts.uniqueContributors >= 50 || currentIncident.roomId;

  const handleAddEvidence = () => {
    alert('Evidence upload dialog: You can attach additional photo corroboration to this existing incident. For demonstration, simulated evidence was registered.');
  };

  return (
    <div className="center-content">
      <div className="detail-page-container">
        {/* Top Back Nav */}
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
            onClick={() => setActiveView('explore')}
          >
            <ArrowLeft size={16} />
            <span>Back to Explore feed</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isRoomActive && (
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#7c3aed',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '6px',
                }}
                onClick={() => setActiveView('incident_room')}
              >
                <MessagesSquare size={15} />
                <span>Open Incident Room</span>
              </button>
            )}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#64748b',
                border: '1px solid #e2e8f0',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert(`Incident reference ${currentIncident.reference} copied to clipboard!`);
              }}
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Header Meta */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
          <span className="category-tag">{currentIncident.category}</span>
          <span
            className={`status-pill ${
              isRoomActive ? 'status-room-active' : 'status-unresolved'
            }`}
          >
            {isRoomActive ? '● Community Incident Room Open' : 'Active · Unresolved'}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Reference: <strong>{currentIncident.reference}</strong>
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
          {currentIncident.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475467', fontSize: '13px', marginBottom: '16px' }}>
          <MapPin size={14} color="#0284c7" />
          <span>{currentIncident.landmark}</span>
          <span>·</span>
          <span>{currentIncident.community}</span>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
          {[
            { id: 'overview', label: 'Overview & Signals' },
            { id: 'evidence', label: `Evidence Gallery (${currentIncident.evidence.length})` },
            { id: 'timeline', label: `Activity Timeline (${timeline.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 4px',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#0284c7' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #0284c7' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & SIGNALS */}
        {activeTab === 'overview' && (
          <div>
            {/* Primary Evidence Thumbnail */}
            {currentIncident.evidence.length > 0 && (
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={
                      evidenceViewMode === 'geotagged' && currentIncident.evidence[0].geotaggedUrl
                        ? currentIncident.evidence[0].geotaggedUrl
                        : currentIncident.evidence[0].url
                    }
                    alt={currentIncident.title}
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                  />
                  {currentIncident.evidence[0].geotaggedUrl && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                      <div className="preview-segmented-control">
                        <button
                          type="button"
                          className={`preview-segmented-btn ${evidenceViewMode === 'geotagged' ? 'active' : ''}`}
                          onClick={() => setEvidenceViewMode('geotagged')}
                        >
                          🏷️ Geotagged
                        </button>
                        <button
                          type="button"
                          className={`preview-segmented-btn ${evidenceViewMode === 'original' ? 'active' : ''}`}
                          onClick={() => setEvidenceViewMode('original')}
                        >
                          📷 Original
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span>
                    {evidenceViewMode === 'geotagged' && currentIncident.evidence[0].geotaggedUrl
                      ? 'Geotagged Photo Variant'
                      : 'Original Photographic Evidence'}{' '}
                    · Contributed by{' '}
                    <strong>
                      {currentIncident.evidence[0].hideIdentityOnOverlay
                        ? 'Community Contributor (Name hidden on public overlay)'
                        : currentIncident.evidence[0].contributorName}
                    </strong>{' '}
                    · {currentIncident.evidence[0].timestamp}
                  </span>
                  <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                    ✓ Evidence integrity preserved
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
              {currentIncident.description}
            </div>

            {/* 7 Independent Counters Grid (Strictly separated per prompt) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{currentIncident.counts.witnesses}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Witnesses</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{currentIncident.counts.affected}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Affected Residents</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{currentIncident.counts.evidenceItems}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Evidence Items</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{currentIncident.counts.stillHappeningCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Still Happening</div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7' }}>{currentIncident.counts.uniqueContributors}</div>
                <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700 }}>Eligible Contributors (50 for room)</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{currentIncident.counts.followers}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Followers</div>
              </div>
            </div>

            {/* Threshold 50 Progress Box */}
            <div className="contributor-progress-box" style={{ marginBottom: '20px' }}>
              <div className="progress-header">
                <span>
                  {isRoomActive ? 'Community Incident Room Live' : 'Unique Eligible Contributors Progress'}
                </span>
                <span>
                  <strong>{currentIncident.counts.uniqueContributors}</strong> / 50 contributors
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, (currentIncident.counts.uniqueContributors / 50) * 100)}%`,
                  }}
                />
              </div>
              {!isRoomActive && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  {50 - currentIncident.counts.uniqueContributors} more unique eligible contributors required
                  to unlock a dedicated community workspace and signature campaign.
                </div>
              )}
            </div>

            {/* Civic Gestures Action Toolbar */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>
                Civic Gestures (Record your observation)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  className={`gesture-btn ${currentIncident.userGestures.witnessed ? 'active' : ''}`}
                  onClick={() => toggleGesture(currentIncident.id, 'witnessed')}
                >
                  <Eye size={15} />
                  <span>I Saw This</span>
                </button>

                <button
                  className={`gesture-btn ${currentIncident.userGestures.affected ? 'active' : ''}`}
                  onClick={() => toggleGesture(currentIncident.id, 'affected')}
                >
                  <Users size={15} />
                  <span>I'm Affected</span>
                </button>

                <button
                  className={`gesture-btn ${currentIncident.userGestures.stillHappening ? 'active' : ''}`}
                  onClick={() => toggleGesture(currentIncident.id, 'stillHappening')}
                >
                  <Clock size={15} />
                  <span>Still Happening</span>
                </button>

                <button
                  className={`gesture-btn ${currentIncident.userGestures.canHelp ? 'active' : ''}`}
                  onClick={() => toggleGesture(currentIncident.id, 'canHelp')}
                >
                  <ThumbsUp size={15} />
                  <span>I Can Help</span>
                </button>

                <button
                  className={`gesture-btn ${currentIncident.userGestures.fixedHere ? 'active' : ''}`}
                  onClick={() => toggleGesture(currentIncident.id, 'fixedHere')}
                >
                  <CheckCircle2 size={15} />
                  <span>Fixed Here</span>
                </button>

                <button className="gesture-btn" onClick={handleAddEvidence}>
                  <Camera size={15} />
                  <span>Add Evidence</span>
                </button>

                <button
                  className={`gesture-btn ${currentIncident.userGestures.followed ? 'active' : ''}`}
                  onClick={() => toggleGesture(currentIncident.id, 'followed')}
                >
                  {currentIncident.userGestures.followed ? '✓ Following' : 'Follow Incident'}
                </button>
              </div>
            </div>

            {/* AI Assessment Panel (Mock Prototype Results) */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>
                <Sparkles size={16} />
                <span>AI Assessment Panel · Prototype Mock Engine</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Suggested Category: </span>
                  <strong>{currentIncident.category}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Evidence Completeness: </span>
                  <strong style={{ color: '#15803d' }}>Adequate (Road edge visible)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Proximity Cluster: </span>
                  <strong>{currentIncident.aiSuggestion?.matchReason || 'No nearby cluster'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Recommended Recipient: </span>
                  <strong>BBMP Road Infrastructure & Engineering</strong>
                </div>
              </div>

              {currentIncident.aiSuggestion?.relatedReportCount ? (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#1e3a8a' }}>
                    {currentIncident.aiSuggestion.relatedReportCount} related candidate reports available for consolidation.
                  </span>
                  <button
                    className="ai-review-btn"
                    onClick={() => {
                      setConsolidationTargetIncident(currentIncident);
                      setIsConsolidationModalOpen(true);
                    }}
                  >
                    Open Consolidation Review
                  </button>
                </div>
              ) : null}
            </div>

            {/* Location Map Preview */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                Incident Pin Location
              </div>
              <InteractiveMap
                lat={currentIncident.location.lat}
                lng={currentIncident.location.lng}
                isDraggable={false}
              />
            </div>
          </div>
        )}

        {/* TAB 2: EVIDENCE GALLERY */}
        {activeTab === 'evidence' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {currentIncident.evidence.map((ev) => (
              <div
                key={ev.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                }}
              >
                <img
                  src={ev.url}
                  alt={ev.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{ev.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Contributed by {ev.contributorName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {ev.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="timeline-feed">
            {timeline.map((evt) => (
              <div key={evt.id} className="timeline-item-row">
                <div className="timeline-dot">
                  <Clock size={16} />
                </div>
                <div className="timeline-content-box">
                  <div className="timeline-title">{evt.title}</div>
                  <div className="timeline-desc">{evt.description}</div>
                  <div className="timeline-meta-sub">
                    {evt.timestamp} · Actor: {evt.actor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
