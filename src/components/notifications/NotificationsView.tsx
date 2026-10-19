import React from 'react';
import { Bell, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, setActiveView, setCurrentIncidentId } = useCivic();

  return (
    <div className="center-content">
      <div className="detail-page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            Notifications & Direct Messages
          </h1>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {notifications.filter((n) => !n.isRead).length} unread
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.targetId && n.linkTab === 'incident_detail') {
                    setCurrentIncidentId(n.targetId);
                  }
                  if (n.linkTab) setActiveView(n.linkTab as any);
                }}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: n.isRead ? '#e2e8f0' : '#bae6fd',
                  backgroundColor: n.isRead ? '#fff' : '#f0f9ff',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: n.type === 'campaign' ? '#7c3aed' : '#0284c7',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bell size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475467', marginTop: '2px' }}>
                    {n.body}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    {n.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
