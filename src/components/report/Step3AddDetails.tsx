import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckSquare,
  Square,
  Info,
  Calendar,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ISSUE_CATEGORIES, getCategoryById } from '../../data/categories';
import { SeverityLevel } from '../../types';

export const Step3AddDetails: React.FC = () => {
  const { reportDraft, updateDraft, setWizardStep } = useCivic();

  const [title, setTitle] = useState(reportDraft.title);
  const [description, setDescription] = useState(reportDraft.description);
  const [categoryId, setCategoryId] = useState(reportDraft.categoryId);
  const [severity, setSeverity] = useState<SeverityLevel>(reportDraft.severity);
  const [observedAt, setObservedAt] = useState(reportDraft.observedAt);
  const [stillHappening, setStillHappening] = useState(reportDraft.stillHappening);
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);

  const selectedCategoryConfig = getCategoryById(categoryId);

  const handleUseSuggestedTitle = () => {
    setTitle('Dangerous pothole near the main college gate');
    setCategoryId('roads_footpaths');
    setDescription(
      'A deep pothole at the BMSCE main gate forces cyclists toward moving traffic. Rainwater makes the depth difficult to judge. I observed loose asphalt at the edge during the morning college rush.'
    );
  };

  const handleContinue = () => {
    if (!title.trim()) {
      alert('Please enter an incident title.');
      return;
    }
    if (!description.trim()) {
      alert('Please provide an incident description to help neighbors corroborate.');
      return;
    }

    updateDraft({
      title,
      description,
      categoryId,
      severity,
      observedAt,
      stillHappening,
    });
    setWizardStep(4);
  };

  return (
    <div className="wizard-container">
      {/* Top Header */}
      <div className="wizard-top-header">
        <div className="wizard-breadcrumb">REPORT A CIVIC ISSUE / SAMPLE REPORT</div>
        <div className="wizard-title-row">
          <h1 className="wizard-main-title">Tell the community what’s happening.</h1>
          <button
            className="wizard-save-draft"
            onClick={() => {
              updateDraft({ title, description, categoryId, severity, observedAt, stillHappening });
              alert('Draft saved to local browser state!');
            }}
          >
            Save Draft
          </button>
        </div>
        <div className="wizard-subtitle">
          Describe your own observation. AI can suggest wording, but you stay in control.
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
        <div className="step-indicator-item active">
          <div className="step-number-circle">3</div>
          <span>Add details</span>
        </div>
        <div className="step-indicator-item">
          <div className="step-number-circle">4</div>
          <span>Review & publish</span>
        </div>
      </div>

      {/* Section Heading */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
        Incident details
      </h2>

      {/* AI Suggestion Box (Exact Figma PDF) */}
      {showAiSuggestions && (
        <div className="ai-suggestion-box" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <Sparkles size={16} />
            <span>AI suggestions · editable, not verified</span>
          </div>
          <div style={{ fontSize: '12px', lineHeight: 1.45, color: '#1e3a8a' }}>
            Suggested category: <strong>Roads & footpaths</strong>. Suggested title:{' '}
            <em>"Dangerous pothole near the main college gate."</em> These are suggestions from the sample
            photo, not an official assessment.
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="ai-review-btn" onClick={handleUseSuggestedTitle}>
              Use suggested title
            </button>
            <button
              className="ai-review-btn"
              style={{ backgroundColor: 'transparent', color: '#1e40af', borderColor: 'transparent' }}
              onClick={() => setShowAiSuggestions(false)}
            >
              Dismiss suggestions
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-input"
          value={title}
          placeholder="e.g. Broken streetlight on DVG Road"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          rows={4}
          value={description}
          placeholder="Describe what you observed, affected commuters or residents, and visible risks..."
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-row-2col">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Observed date / time</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
            />
            <Calendar
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', right: '12px', top: '12px' }}
            />
          </div>
        </div>
      </div>

      {/* Safety Hazard Warning if Category has isUrgentHazard */}
      {selectedCategoryConfig.isUrgentHazard && (
        <div className="safety-urgent-callout">
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>URGENT CIVIC SAFETY WARNING:</strong> {selectedCategoryConfig.urgentWarning}
          </div>
        </div>
      )}

      {/* Severity Selector (Exact Figma PDF) */}
      <div className="form-group">
        <label className="form-label">How serious does it appear?</label>
        <div className="severity-options-row">
          {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`severity-pill-btn ${severity === lvl ? `active-${lvl}` : ''}`}
              onClick={() => setSeverity(lvl)}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
          Your assessment of severity, not an official classification. For immediate danger, contact local emergency services.
        </div>
      </div>

      {/* Still Happening Checkbox */}
      <div
        className="checkbox-row"
        onClick={() => setStillHappening(!stillHappening)}
      >
        {stillHappening ? (
          <CheckSquare size={18} color="#0284c7" />
        ) : (
          <Square size={18} color="#94a3b8" />
        )}
        <span>Still happening at the time I observed it</span>
      </div>

      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
        No personal accusations or private contact details. Keep your description factual and specific.
      </div>

      {/* Footer Navigation */}
      <div className="wizard-footer-nav">
        <button className="btn-wizard-back" onClick={() => setWizardStep(2)}>
          Back to location
        </button>
        <button className="btn-wizard-continue" onClick={handleContinue}>
          Review report
        </button>
      </div>
    </div>
  );
};
