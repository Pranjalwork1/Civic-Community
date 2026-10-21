import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  Send,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { sendAssistantMessage } from '../../services/assistantService';
import './AiAssistantDrawer.css';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onToggle }) => {
  const { setActiveView, setWizardStep, resetDraft, selectedLocation } = useCivic();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hello! I am the CivicSignal Assistant. I can help you classify civic hazards, explain photo evidence guidelines, or guide you through neighborhood petition tracking in ${selectedLocation?.locality || 'your area'}. What would you like help with?`,
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    'How does the 50-contributor threshold work?',
    'What evidence do I need for a broken streetlight?',
    'How do I file an urgent electrical hazard?',
    'Explain petition signatures & leader review',
  ];

  // Auto-scroll to the newest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onToggle]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) {
      setInputValue('');
    }
    setIsLoading(true);

    try {
      const locality = selectedLocation?.locality || 'Knowledge Park III';
      const reply = await sendAssistantMessage(text, locality);

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: reply,
        time: replyTime,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm having trouble connecting right now. Please try again in a moment.",
          time: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the drawer inside a Portal to document.body so parent positioning/stacking never traps it
  const drawerPortal =
    isOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="ai-drawer-overlay"
            onClick={onToggle}
            role="dialog"
            aria-modal="true"
            aria-label="CivicSignal Intelligence Assistant"
          >
            <div
              className="ai-drawer-panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="ai-drawer-header">
                <div className="ai-drawer-title-group">
                  <div className="ai-drawer-icon-box" aria-hidden="true">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="ai-drawer-title">CivicSignal Intelligence Assistant</h3>
                    <p className="ai-drawer-subtitle">
                      Autonomous civic agent & coordination guide
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="ai-drawer-close-btn"
                  onClick={onToggle}
                  title="Close Assistant"
                  aria-label="Close Assistant"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Prompts Bar */}
              <div className="ai-quick-prompts" aria-label="Suggested quick questions">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="ai-quick-chip"
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="ai-drawer-messages" role="log" aria-live="polite">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`ai-message-bubble ${m.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
                  >
                    <div className="ai-msg-text">{m.text}</div>
                    <div className="ai-msg-time">{m.time}</div>
                  </div>
                ))}

                {/* Visible Loading Indicator */}
                {isLoading && (
                  <div
                    className="ai-message-bubble ai-msg ai-msg-loading"
                    aria-label="CivicSignal AI is typing"
                  >
                    <div className="ai-typing-indicator" aria-hidden="true">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                    <div className="ai-msg-time">CivicSignal AI is responding...</div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Direct Action Shortcut */}
              <div className="ai-drawer-shortcut-bar">
                <button
                  type="button"
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

              {/* Message Input Form */}
              <form
                className="ai-drawer-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="ai-drawer-input"
                  placeholder="Ask about guidelines, thresholds, or evidence..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  aria-label="Message to CivicSignal Assistant"
                />
                <button
                  type="submit"
                  className="ai-drawer-send-btn"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* Floating Trigger Button (Fixed at Bottom-Right of Viewport) */}
      <button
        type="button"
        className="ai-assistant-floating-trigger"
        onClick={onToggle}
        aria-label="Open CivicSignal AI Assistant"
        aria-expanded={isOpen}
      >
        <div className="ai-trigger-sparkle" aria-hidden="true">
          <Sparkles size={16} />
        </div>
        <div className="ai-trigger-content">
          <span className="ai-trigger-title">CivicSignal AI</span>
          <span className="ai-trigger-sub">Need help with a civic issue?</span>
        </div>
      </button>

      {/* Slide-Over Drawer Portal */}
      {drawerPortal}
    </>
  );
};
