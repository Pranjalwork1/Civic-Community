import React, { useState } from 'react';
import {
  X,
  GitMerge,
  CheckCircle,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { CANDIDATE_DUPLICATE_REPORTS } from '../../data/mockData';

export const ConsolidationModal: React.FC = () => {
  const {
    isConsolidationModalOpen,
    setIsConsolidationModalOpen,
    consolidationTargetIncident,
    consolidateReports,
    currentUser,
  } = useCivic();

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    CANDIDATE_DUPLICATE_REPORTS.map((c) => c.id)
  );

  if (!isConsolidationModalOpen || !consolidationTargetIncident) return null;

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCombine = () => {
    if (selectedCandidateIds.length === 0) {
      alert('Please select at least one candidate report to combine.');
      return;
    }
    consolidateReports(consolidationTargetIncident.id, selectedCandidateIds);
    setIsConsolidationModalOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitMerge size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Review Related Reports for Consolidation
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Master Reference: {consolidationTargetIncident.reference} · {consolidationTargetIncident.title}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsConsolidationModalOpen(false)}
            style={{ color: '#94a3b8', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Explainability Banner */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#1e40af',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <Sparkles size={14} />
            <span>AI Multi-Signal Match Analysis</span>
          </div>
          CivicSignal identified {CANDIDATE_DUPLICATE_REPORTS.length} independently submitted neighbor
          reports within 50 metres along Bull Temple Road. Combining them groups collective evidence and
          contributors without erasing the original submissions.
        </div>

        {/* Candidate List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {CANDIDATE_DUPLICATE_REPORTS.map((c) => {
            const isSelected = selectedCandidateIds.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => toggleCandidate(c.id)}
                style={{
                  border: '1px solid',
                  borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  backgroundColor: isSelected ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Reported by <strong>{c.reporterName}</strong> ({c.originalReportId}) · {c.timestamp}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {c.similarityScore}% match
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#475467', margin: '8px 0 6px 26px', lineHeight: 1.4 }}>
                  {c.description}
                </div>

                {/* Match factors */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '26px' }}>
                  {c.matchingFactors.map((f, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        backgroundColor: '#e2e8f0',
                        color: '#475467',
                        padding: '1px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Retained Attribution Guarantee */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: '#64748b',
            marginBottom: '16px',
          }}
        >
          <Shield size={14} color="#15803d" />
          <span>
            Attribution policy: Original report timestamps, contributor identities, and photo evidence
            are retained in the consolidated incident history.
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#64748b',
            }}
            onClick={() => setIsConsolidationModalOpen(false)}
          >
            Keep Separate
          </button>
          <button
            style={{
              padding: '8px 18px',
              backgroundColor: '#0284c7',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={handleCombine}
          >
            <GitMerge size={15} />
            <span>Combine {selectedCandidateIds.length} Selected Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
