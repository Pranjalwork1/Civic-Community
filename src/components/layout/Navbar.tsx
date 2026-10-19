import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  PlusCircle,
  ShieldAlert,
  User,
  RotateCcw,
  Sparkles,
  MapPin,
  Compass,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DEMO_USERS } from '../../data/mockData';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead,
    setActiveView,
    setWizardStep,
    resetDraft,
    resetAllDemoData,
    selectedLocation,
    selectedRadiusKm,
    setSelectedRadiusKm,
    setIsLocationModalOpen,
  } = useCivic();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const handleStartReport = () => {
    resetDraft();
    setWizardStep(1);
    setActiveView('report_wizard');
  };

  return (
    <header className="top-navbar">
      {/* Brand */}
      <div className="brand-section">
        <button
          className="brand-logo"
          onClick={() => setActiveView('explore')}
          title="CivicSignal Home"
        >
          <div className="brand-logo-icon">
            <ShieldAlert size={19} />
          </div>
          <span>CivicSignal</span>
          <span className="brand-tag-beta">CIVIC</span>
        </button>
      </div>

      {/* Center Search & Community Selector */}
      <div className="nav-center">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder={
              selectedLocation
                ? `Search CivicSignal or c/${selectedLocation.locality}...`
                : 'Search CivicSignal or choose location...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic Location / Community Selector */}
        <div style={{ position: 'relative' }}>
          <button
            className="community-selector"
            onClick={() => setIsCommunityMenuOpen(!isCommunityMenuOpen)}
            title="Click to view or change your browsing neighborhood"
          >
            <MapPin size={14} color={selectedLocation ? '#ff4500' : '#64748b'} />
            {selectedLocation ? (
              <>
                <span className="community-pill-prefix">c/</span>
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedLocation.locality}
                </span>
              </>
            ) : (
              <span style={{ color: '#64748b', fontWeight: 500 }}>Choose your location</span>
            )}
            <ChevronDown size={14} color="#64748b" />
          </button>

          {isCommunityMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                width: '280px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '12px',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.16)',
                padding: '12px',
                zIndex: 60,
              }}
            >
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Current Browsing Location
              </div>

              {selectedLocation ? (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 69, 0, 0.08)',
                    border: '1px solid rgba(255, 69, 0, 0.2)',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#ff4500' }}>
                    c/{selectedLocation.locality}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                    {selectedLocation.city} {selectedLocation.state ? `· ${selectedLocation.state}` : ''}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px' }}>
                    {selectedLocation.lat.toFixed(4)}° N, {selectedLocation.lng.toFixed(4)}° E · {selectedLocation.accuracy || selectedLocation.source}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                >
                  No browsing location selected yet.
                </div>
              )}

              {/* Feed Radius Filter */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Nearby Radius: {selectedRadiusKm} km
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[2, 5, 10, 25].map((km) => (
                    <button
                      key={km}
                      onClick={() => setSelectedRadiusKm(km)}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        backgroundColor: selectedRadiusKm === km ? '#0284c7' : '#f1f5f9',
                        color: selectedRadiusKm === km ? '#fff' : '#475469',
                      }}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Action button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: '#ff4500',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  boxShadow: '0 2px 6px rgba(255, 69, 0, 0.25)',
                }}
                onClick={() => {
                  setIsCommunityMenuOpen(false);
                  setIsLocationModalOpen(true);
                }}
              >
                <Compass size={14} />
                <span>Change or Search Location</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nav Actions */}
      <div className="nav-actions">
        <button className="btn-primary-create" onClick={handleStartReport}>
          <PlusCircle size={16} />
          <span>Create</span>
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadNotifs.length > 0 && <span className="notif-badge" />}
          </button>

          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '320px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                padding: '12px',
                zIndex: 60,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {unreadNotifs.length} new
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setActiveView(n.linkTab as any);
                        setIsNotifOpen(false);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: n.isRead ? '#fff' : '#f0f9ff',
                        border: '1px solid',
                        borderColor: n.isRead ? '#f1f5f9' : '#bae6fd',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{n.title}</div>
                      <div style={{ color: '#475467', marginTop: '2px' }}>{n.body}</div>
                      <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '4px' }}>
                        {n.timestamp}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Persona & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="user-avatar-btn"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="avatar-badge">{currentUser.avatar}</div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '240px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                padding: '12px',
                zIndex: 60,
              }}
            >
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{currentUser.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{currentUser.locality}</div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {currentUser.role.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', margin: '6px 0 4px', textTransform: 'uppercase' }}>
                Switch Demo Persona
              </div>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    textAlign: 'left',
                    backgroundColor: currentUser.id === u.id ? '#f1f5f9' : 'transparent',
                    fontWeight: currentUser.id === u.id ? 600 : 400,
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {u.avatar}
                  </span>
                  <span>{u.name}</span>
                </button>
              ))}

              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '8px' }}>
                <button
                  onClick={() => {
                    resetAllDemoData();
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    color: '#b91c1c',
                    fontSize: '12px',
                    padding: '6px 8px',
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
