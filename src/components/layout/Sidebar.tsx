import React from 'react';
import {
  Home,
  Compass,
  TrendingUp,
  Users,
  FileText,
  Bell,
  Bookmark,
  User,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setActiveCategoryFilter,
    setActiveFeedTab,
    notifications,
  } = useCivic();

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleHomeClick = () => {
    setActiveCategoryFilter('all');
    setActiveFeedTab('all');
    setActiveView('explore');
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: activeView === 'explore',
      onClick: handleHomeClick,
    },
    {
      id: 'explore_map',
      label: 'Explore map',
      icon: Compass,
      isActive: false,
      onClick: () => {
        setActiveCategoryFilter('all');
        setActiveFeedTab('nearby');
        setActiveView('explore');
      },
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      isActive: false,
      onClick: () => {
        setActiveFeedTab('recently_updated');
        setActiveView('explore');
      },
    },
    {
      id: 'communities',
      label: 'Communities',
      icon: Users,
      isActive: false,
      badge: 1,
      onClick: () => {
        setActiveFeedTab('communities');
        setActiveView('explore');
      },
    },
    {
      id: 'petitions',
      label: 'Petitions',
      icon: FileText,
      isActive: activeView === 'tracking',
      onClick: () => setActiveView('tracking'),
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      isActive: activeView === 'notifications',
      badge: unreadNotifsCount || 6,
      onClick: () => setActiveView('notifications'),
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Bookmark,
      isActive: false,
      onClick: () => {
        setActiveFeedTab('needs_attention');
        setActiveView('explore');
      },
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      isActive: false,
      onClick: () => {
        setActiveView('explore');
      },
    },
  ];

  return (
    <aside className="left-nav-container" aria-label="Main Navigation">
      <nav className="left-nav-list" role="navigation" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`left-nav-item ${item.isActive ? 'active' : ''}`}
              onClick={item.onClick}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <Icon
                size={18}
                strokeWidth={2}
                className="left-nav-icon"
                aria-hidden="true"
              />
              <span className="left-nav-label">{item.label}</span>
              {item.badge !== undefined && (
                <span className="left-nav-badge" aria-label={`${item.badge} notifications`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
