import {
  IncidentRecord,
  CommunityRoom,
  RoomMessage,
  SignatureCampaign,
  ComplaintDocument,
  TimelineEvent,
  NotificationItem,
  UserProfile,
} from '../types';
import { INITIAL_INCIDENTS, INITIAL_ROOM_MESSAGES, DEMO_USERS } from '../data/mockData';

const STORAGE_KEYS = {
  INCIDENTS: 'civicsignal_incidents_v2',
  ROOMS: 'civicsignal_rooms_v2',
  MESSAGES: 'civicsignal_messages_v2',
  CAMPAIGNS: 'civicsignal_campaigns_v2',
  COMPLAINTS: 'civicsignal_complaints_v2',
  TIMELINE: 'civicsignal_timeline_v2',
  NOTIFICATIONS: 'civicsignal_notifications_v2',
  CURRENT_USER: 'civicsignal_current_user_v2',
};

export const storageService = {
  loadIncidents(): IncidentRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read incidents from localStorage:', e);
    }
    return INITIAL_INCIDENTS;
  },

  saveIncidents(incidents: IncidentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.warn('Could not save incidents to localStorage:', e);
    }
  },

  loadRooms(): CommunityRoom[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  },

  saveRooms(rooms: CommunityRoom[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch (e) {}
  },

  loadMessages(): Record<string, RoomMessage[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      'room-1042': INITIAL_ROOM_MESSAGES,
    };
  },

  saveMessages(messages: Record<string, RoomMessage[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {}
  },

  loadCampaigns(): Record<string, SignatureCampaign> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  },

  saveCampaigns(campaigns: Record<string, SignatureCampaign>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {}
  },

  loadComplaints(): Record<string, ComplaintDocument> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  },

  saveComplaints(complaints: Record<string, ComplaintDocument>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    } catch (e) {}
  },

  loadTimeline(): Record<string, TimelineEvent[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TIMELINE);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      'inc-1042': [
        {
          id: 'tl-1',
          incidentId: 'inc-1042',
          title: 'Initial report registered',
          description: 'Ananya Sharma published photographic evidence from BMSCE main gate.',
          timestamp: '12 Oct 2026, 08:40 IST',
          actor: 'Ananya Sharma',
          type: 'report',
        },
        {
          id: 'tl-2',
          incidentId: 'inc-1042',
          title: 'Location confirmed & corroboration started',
          description: 'Device coordinates confirmed at Bull Temple Road with landmark opposite college entrance.',
          timestamp: '12 Oct 2026, 08:45 IST',
          actor: 'CivicSignal Core',
          type: 'evidence',
        },
        {
          id: 'tl-3',
          incidentId: 'inc-1042',
          title: 'AI suggested duplicate consolidation',
          description: '3 independent reports identified along the same 75m stretch.',
          timestamp: '12 Oct 2026, 09:00 IST',
          actor: 'CivicSignal AI Engine (Mock)',
          type: 'consolidation',
        },
      ],
    };
  },

  saveTimeline(timeline: Record<string, TimelineEvent[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
    } catch (e) {}
  },

  loadNotifications(): NotificationItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'notif-1',
        title: 'College Gate Incident is close to room threshold',
        body: 'CS-BSG-1042 has 42 of 50 unique eligible contributors needed to open an incident room.',
        timestamp: '15 min ago',
        isRead: false,
        linkTab: 'incident_detail',
        targetId: 'inc-1042',
        type: 'room',
      },
      {
        id: 'notif-2',
        title: 'New witness signal on DVG Road',
        body: '3 neighbors corroborated the dark streetlight stretch near Tagore Circle.',
        timestamp: '1 hour ago',
        isRead: false,
        linkTab: 'explore',
        targetId: 'inc-1051',
        type: 'gesture',
      },
    ];
  },

  saveNotifications(notifs: NotificationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {}
  },

  loadCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEMO_USERS[0]; // Ananya Sharma
  },

  saveCurrentUser(user: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {}
  },

  resetAll(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
