import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  FileQuestion,
  Users,
  ShieldAlert,
  ArrowRight,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

import { sendAssistantMessage } from '../../services/assistantService';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onToggle }) => {
  const { setActiveView, setWizardStep, resetDraft, selectedLocation, incidents } = useCivic();
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am the CivicSignal Assistant. I can help you classify civic hazards, explain photo evidence guidelines, or guide you through neighborhood petition tracking in ${selectedLocation?.locality || 'your area'}. What would you like help with?`,
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickPrompts = [
    'How does the 50-contributor threshold work?',
    'What evidence do I need for a broken streetlight?',
    'How do I file an urgent electrical hazard?',
    'Explain petition signatures & leader review',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    const locality = selectedLocation?.locality || 'Knowledge Park III';
    const reply = await sendAssistantMessage(text, locality);

    const aiMsg = {
      sender: 'ai' as const,
      text: reply,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <>
      {/* Subtle Floating Bottom Entry Point (Section 25) */}
      <div className="ai-assistant-floating-trigger" onClick={onToggle}>
        <div className="ai-trigger-sparkle">
          <Sparkles size={16} />
        </div>
        <div className="ai-trigger-content">
          <span className="ai-trigger-title">CivicSignal AI</span>
          <span className="ai-trigger-sub">Need help with a civic issue?</span>
        </div>
      </div>

      {/* Slide-Over Drawer */}
      {isOpen && (
        <div className="ai-drawer-overlay" onClick={onToggle}>
          <div className="ai-drawer-panel" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="ai-drawer-header">
              <div className="ai-drawer-title-group">
                <div className="ai-drawer-icon-box">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="ai-drawer-title">CivicSignal Intelligence Assistant</h3>
                  <p className="ai-drawer-subtitle">
                    Autonomous civic agent & coordination guide
                  </p>
                </div>
              </div>
              <button className="ai-drawer-close-btn" onClick={onToggle} title="Close Assistant">
                <X size={18} />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="ai-quick-prompts">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  className="ai-quick-chip"
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="ai-drawer-messages">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`ai-message-bubble ${m.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
                >
                  <div className="ai-msg-text">{m.text}</div>
                  <div className="ai-msg-time">{m.time}</div>
                </div>
              ))}
            </div>

            {/* Direct Action Shortcut */}
            <div className="ai-drawer-shortcut-bar">
              <button
                className="ai-shortcut-btn"
                onClick={() => {
                  resetDraft();
                  setWizardStep(1);
                  setActiveView('report_wizard');
                  onToggle();
                }}
              >
                <span>Start New Civic Report</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Message Input */}
            <form
              className="ai-drawer-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                className="ai-drawer-input"
                placeholder="Ask about guidelines, thresholds, or evidence..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className="ai-drawer-send-btn" disabled={!inputValue.trim()}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
