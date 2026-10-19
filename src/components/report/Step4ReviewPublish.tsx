import React from 'react';
import {
  CheckCircle2,
  MapPin,
  Camera,
  FileText,
  Shield,
  Edit2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { getCategoryById } from '../../data/categories';

export const Step4ReviewPublish: React.FC = () => {
  const {
    reportDraft,
    setWizardStep,
    publishReport,
    setActiveView,
    currentUser,
  } = useCivic();

  const [evidencePreviewTab, setEvidencePreviewTab] = React.useState<'geotagged' | 'original'>('geotagged');
  const categoryConfig = getCategoryById(reportDraft.categoryId);

  const handlePublish = () => {
    const published = publishReport();
    // After publishing, notify and navigate
  };

  return (
    <div className="wizard-container">
      {/* Top Header */}
      <div className="wizard-top-header">
        <div className="wizard-breadcrumb">REPORT A CIVIC ISSUE / STEP 4</div>
        <div className="wizard-title-row">
          <h1 className="wizard-main-title">Review before publishing.</h1>
          <button
            className="wizard-save-draft"
            onClick={() => alert('Draft saved to local browser state!')}
          >
            Save Draft
          </button>
        </div>
        <div className="wizard-subtitle">
          Confirm your observation details. Your neighbors will see this in the {reportDraft.location?.locality || 'community'} feed.
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="wizard-stepper">
        <div className="step-indicator-item completed">
          <div className="step-number-circle">✓</div>
          <span>Capture evidence</span>
        </div>
        <div className="step-indicator-item completed">
          <div className="step-number-circle">✓</div>
          <span>Confirm location</span>
        </div>
        <div className="step-indicator-item completed">
          <div className="step-number-circle">✓</div>
          <span>Add details</span>
        </div>
        <div className="step-indicator-item active">
          <div className="step-number-circle">4</div>
          <span>Review & publish</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {/* Section 1: Photographic Evidence */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
              <Camera size={16} color="#0284c7" />
              <span>Evidence Attachment ({reportDraft.evidence.length})</span>
            </div>
            <button
              style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setWizardStep(1)}
            >
              <Edit2 size={12} />
              <span>Edit Evidence</span>
            </button>
          </div>

          {reportDraft.evidence.length > 0 ? (
            <div>
              {/* Evidence Preview Switcher */}
              {reportDraft.evidence[0].geotaggedUrl && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      backgroundColor: evidencePreviewTab === 'geotagged' ? '#0f172a' : '#f8fafc',
                      color: evidencePreviewTab === 'geotagged' ? '#ffffff' : '#475569',
                    }}
                    onClick={() => setEvidencePreviewTab('geotagged')}
                  >
                    🏷️ Geotagged Photo
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      backgroundColor: evidencePreviewTab === 'original' ? '#0f172a' : '#f8fafc',
                      color: evidencePreviewTab === 'original' ? '#ffffff' : '#475569',
                    }}
                    onClick={() => setEvidencePreviewTab('original')}
                  >
                    📷 Original Photo
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <img
                  src={
                    evidencePreviewTab === 'geotagged' && reportDraft.evidence[0].geotaggedUrl
                      ? reportDraft.evidence[0].geotaggedUrl
                      : reportDraft.evidence[0].url
                  }
                  alt="Evidence Preview"
                  style={{
                    width: '180px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                />
                <div style={{ fontSize: '13px', flex: 1, minWidth: '220px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{reportDraft.evidence[0].name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                    {reportDraft.evidence[0].size} · Captured: {reportDraft.evidence[0].timestamp}
                  </div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
                    <strong>Reporter attribution: </strong>
                    {reportDraft.evidence[0].hideIdentityOnOverlay
                      ? `Community Contributor (Identity hidden on public overlay per privacy setting · Real user: ${currentUser.name})`
                      : currentUser.name}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#15803d', fontSize: '11px', fontWeight: 600, backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>
                      ✓ Original evidence preserved
                    </span>
                    {reportDraft.evidence[0].geotaggedUrl && (
                      <span style={{ color: '#0369a1', fontSize: '11px', fontWeight: 600, backgroundColor: '#f0f9ff', padding: '2px 8px', borderRadius: '4px' }}>
                        ✓ Geotagged derivative generated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#b91c1c', fontSize: '13px' }}>No evidence attached</div>
          )}
        </div>

        {/* Section 2: Location & Landmark */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
              <MapPin size={16} color="#0284c7" />
              <span>Reviewed Incident Location</span>
            </div>
            <button
              style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setWizardStep(2)}
            >
              <Edit2 size={12} />
              <span>Edit Location</span>
            </button>
          </div>

          <div style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Location: </span>
              <strong>{reportDraft.location?.name}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Locality / City: </span>
              <strong>
                {reportDraft.location?.locality} / {reportDraft.location?.city}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Landmark: </span>
              <strong>{reportDraft.location?.landmark || 'None specified'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Coordinates: </span>
              <code>
                {reportDraft.location?.lat}° N, {reportDraft.location?.lng}° E
              </code>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Accuracy: </span>
              <span>{reportDraft.location?.accuracy || 'Standard precision'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Source: </span>
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                {reportDraft.location?.source}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Details & Category */}
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
              <FileText size={16} color="#0284c7" />
              <span>Issue Details & Classification</span>
            </div>
            <button
              style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setWizardStep(3)}
            >
              <Edit2 size={12} />
              <span>Edit Details</span>
            </button>
          </div>

          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Title
            </span>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{reportDraft.title}</div>
          </div>

          <div style={{ fontSize: '13px', marginBottom: '10px', color: '#334155', lineHeight: 1.5 }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              Description
            </span>
            {reportDraft.description}
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Category: </span>
              <strong>{categoryConfig.name}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Perceived Severity: </span>
              <span
                style={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor:
                    reportDraft.severity === 'critical'
                      ? '#fee2e2'
                      : reportDraft.severity === 'high'
                      ? '#ffedd5'
                      : '#f1f5f9',
                  color:
                    reportDraft.severity === 'critical'
                      ? '#b91c1c'
                      : reportDraft.severity === 'high'
                      ? '#c2410c'
                      : '#334155',
                }}
              >
                {reportDraft.severity}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Status: </span>
              <strong>{reportDraft.stillHappening ? 'Still happening' : 'Past observation'}</strong>
            </div>
          </div>
        </div>

        {/* Privacy & Prototype Notice */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#475467',
          }}
        >
          <Shield size={18} color="#0284c7" style={{ flexShrink: 0 }} />
          <span>
            <strong>Civic Privacy Guarantee:</strong> By publishing, this record will be added to the {reportDraft.location?.locality || 'local'}
            {' '}community workspace. Your exact coordinates are recorded solely for municipal verification.
            Neighbors will see your name and community badge.
          </span>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="wizard-footer-nav">
        <button className="btn-wizard-back" onClick={() => setWizardStep(3)}>
          Back to details
        </button>
        <button
          className="btn-wizard-continue"
          style={{
            backgroundColor: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onClick={handlePublish}
        >
          <Send size={16} />
          <span>Publish Report</span>
        </button>
      </div>
    </div>
  );
};
