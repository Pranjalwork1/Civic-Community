import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  IncidentRecord,
  CommunityRoom,
  RoomMessage,
  SignatureCampaign,
  ComplaintDocument,
  TimelineEvent,
  NotificationItem,
  UserProfile,
  ReportDraft,
  EvidenceItem,
  CivicGestures,
  UserSelectedLocation,
} from '../types';
import { storageService } from '../services/storageService';
import { locationService } from '../services/locationService';
import { CANDIDATE_DUPLICATE_REPORTS, DEMO_USERS, SAMPLE_IMAGES } from '../data/mockData';
import { getCategoryById } from '../data/categories';

export type ActiveView =
  | 'explore'
  | 'report_wizard'
  | 'incident_detail'
  | 'incident_room'
  | 'leader_approval'
  | 'complaint_doc'
  | 'tracking'
  | 'notifications';

interface CivicContextType {
  incidents: IncidentRecord[];
  currentIncident: IncidentRecord | null;
  currentIncidentId: string | null;
  activeView: ActiveView;
  wizardStep: 1 | 2 | 3 | 4;
  reportDraft: ReportDraft;
  rooms: CommunityRoom[];
  activeRoom: CommunityRoom | null;
  activeRoomId: string | null;
  roomMessages: Record<string, RoomMessage[]>;
  campaigns: Record<string, SignatureCampaign>;
  complaintDocs: Record<string, ComplaintDocument>;
  timelineEvents: Record<string, TimelineEvent[]>;
  notifications: NotificationItem[];
  currentUser: UserProfile;
  searchQuery: string;
  activeCategoryFilter: string;
  activeFeedTab: string;
  isConsolidationModalOpen: boolean;
  consolidationTargetIncident: IncidentRecord | null;

  // Real Location Management State
  selectedLocation: UserSelectedLocation | null;
  selectedRadiusKm: number;
  isLocationModalOpen: boolean;
  includeDemoDataInFeed: boolean;
  isAiDrawerOpen: boolean;

  // Navigation & Setters
  setActiveView: (view: ActiveView) => void;
  setCurrentIncidentId: (id: string | null) => void;
  setActiveRoomId: (id: string | null) => void;
  setWizardStep: (step: 1 | 2 | 3 | 4) => void;
  setSearchQuery: (q: string) => void;
  setActiveCategoryFilter: (cat: string) => void;
  setActiveFeedTab: (tab: string) => void;
  setIsConsolidationModalOpen: (open: boolean) => void;
  setConsolidationTargetIncident: (inc: IncidentRecord | null) => void;
  setCurrentUser: (user: UserProfile) => void;

  // Location Setters
  setSelectedLocation: (loc: UserSelectedLocation) => void;
  setSelectedRadiusKm: (radius: number) => void;
  setIsLocationModalOpen: (open: boolean) => void;
  setIncludeDemoDataInFeed: (include: boolean) => void;
  setIsAiDrawerOpen: (open: boolean) => void;

  // Actions
  toggleGesture: (incidentId: string, gestureKey: keyof CivicGestures) => void;
  updateDraft: (partial: Partial<ReportDraft>) => void;
  resetDraft: () => void;
  loadSampleDraft: () => void;
  publishReport: () => IncidentRecord;
  consolidateReports: (incidentId: string, candidateIds: string[]) => void;
  sendMessageToRoom: (roomId: string, content: string, imageAttachment?: string) => void;

  // Threshold Simulators & Workflow Actions
  simulateContributors: (incidentId: string, count: number) => void;
  simulateRoomMembers: (roomId: string, count: number) => void;
  signCampaignDecision: (campaignId: string, memberId: string, decision: 'signed' | 'declined') => void;
  simulateAllSignatures: (campaignId: string) => void;
  approveComplaintAsLeader: (complaintId: string, decision: 'approved' | 'changes_requested', notes?: string) => void;
  simulateSendComplaint: (complaintId: string) => void;
  switchUser: (userId: string) => void;
  markNotificationRead: (id: string) => void;
  resetAllDemoData: () => void;
}

// Clean initial empty draft - no fake device coordinates or hardcoded Basavanagudi
export const emptyDraft: ReportDraft = {
  evidence: [],
  location: undefined,
  locationPermissionGranted: false,
  title: '',
  description: '',
  categoryId: 'roads_footpaths',
  severity: 'medium',
  observedAt: 'Just now',
  stillHappening: true,
  isCompleted: false,
};

// Optional sample walkthrough draft with explicitly labeled sample data
export const sampleWalkthroughDraft: ReportDraft = {
  evidence: [
    {
      id: 'draft-ev-sample-1',
      url: SAMPLE_IMAGES.pothole,
      name: 'SAMPLE_POTHOLE_EVIDENCE.jpg',
      size: '2.8 MB',
      type: 'image/jpeg',
      contributorName: 'Ananya Sharma',
      timestamp: 'Sample inspection photo',
      isSample: true,
      locationConfirmed: false,
    },
  ],
  location: {
    name: 'Sample Issue: Bull Temple Road, near BMSCE gate',
    lat: 12.9416,
    lng: 77.5655,
    landmark: 'Opposite college entrance',
    locality: 'Basavanagudi',
    city: 'Bengaluru',
    accuracy: 'Sample reference coordinates',
    source: 'sample',
    isConfirmed: false,
  },
  locationPermissionGranted: false,
  title: 'Dangerous pothole near the main college gate',
  description:
    'A deep pothole at the college entrance forces cyclists into traffic. Water hides the depth after morning rain.',
  categoryId: 'roads_footpaths',
  severity: 'high',
  observedAt: 'Sample observation',
  stillHappening: true,
  isCompleted: false,
};

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => storageService.loadIncidents());
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('explore');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [reportDraft, setReportDraft] = useState<ReportDraft>(emptyDraft);
  const [selectedLocation, setSelectedLocationState] = useState<UserSelectedLocation | null>(() =>
    locationService.getStoredLocation() || {
      name: 'Knowledge Park III, Greater Noida',
      locality: 'Knowledge Park III',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      lat: 28.4619,
      lng: 77.4988,
      accuracy: '±15m',
      source: 'sample',
    }
  );
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [includeDemoDataInFeed, setIncludeDemoDataInFeed] = useState(true);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [rooms, setRooms] = useState<CommunityRoom[]>(() => storageService.loadRooms());
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<Record<string, RoomMessage[]>>(() => storageService.loadMessages());
  const [campaigns, setCampaigns] = useState<Record<string, SignatureCampaign>>(() => storageService.loadCampaigns());
  const [complaintDocs, setComplaintDocs] = useState<Record<string, ComplaintDocument>>(() =>
    storageService.loadComplaints()
  );
  const [timelineEvents, setTimelineEvents] = useState<Record<string, TimelineEvent[]>>(() =>
    storageService.loadTimeline()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storageService.loadNotifications());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.loadCurrentUser());

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activeFeedTab, setActiveFeedTab] = useState('for_you');
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState(false);
  const [consolidationTargetIncident, setConsolidationTargetIncident] = useState<IncidentRecord | null>(null);

  // Sync to persistence
  useEffect(() => {
    storageService.saveIncidents(incidents);
  }, [incidents]);

  useEffect(() => {
    storageService.saveRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    storageService.saveMessages(roomMessages);
  }, [roomMessages]);

  useEffect(() => {
    storageService.saveCampaigns(campaigns);
  }, [campaigns]);

  useEffect(() => {
    storageService.saveComplaints(complaintDocs);
  }, [complaintDocs]);

  useEffect(() => {
    storageService.saveTimeline(timelineEvents);
  }, [timelineEvents]);

  useEffect(() => {
    storageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  const currentIncident = incidents.find((i) => i.id === currentIncidentId) || null;
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;

  // Add timeline helper
  const addTimelineEvent = (
    incidentId: string,
    event: Omit<TimelineEvent, 'id' | 'incidentId'>
  ) => {
    const newEvent: TimelineEvent = {
      id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      incidentId,
      ...event,
    };
    setTimelineEvents((prev) => ({
      ...prev,
      [incidentId]: [newEvent, ...(prev[incidentId] || [])],
    }));
  };

  // Add notification helper
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      isRead: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 1. Toggle Civic Gestures
  const toggleGesture = (incidentId: string, gestureKey: keyof CivicGestures) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const currentVal = inc.userGestures[gestureKey];
        const nextVal = !currentVal;
        const newGestures = { ...inc.userGestures, [gestureKey]: nextVal };

        const newCounts = {
          ...inc.counts,
          didNotSeeCount: inc.counts.didNotSeeCount || 0,
        };

        if (gestureKey === 'witnessed') {
          newCounts.witnesses += nextVal ? 1 : -1;
          // If turning on "I Saw It", mutually turn off "I Didn't See It"
          if (nextVal && inc.userGestures.didNotSee) {
            newGestures.didNotSee = false;
            newCounts.didNotSeeCount = Math.max(0, (newCounts.didNotSeeCount || 1) - 1);
          }
        } else if (gestureKey === 'didNotSee') {
          newCounts.didNotSeeCount = Math.max(0, (newCounts.didNotSeeCount || 0) + (nextVal ? 1 : -1));
          // If turning on "I Didn't See It", mutually turn off "I Saw It"
          if (nextVal && inc.userGestures.witnessed) {
            newGestures.witnessed = false;
            newCounts.witnesses = Math.max(0, newCounts.witnesses - 1);
          }
        } else if (gestureKey === 'affected') {
          newCounts.affected += nextVal ? 1 : -1;
        } else if (gestureKey === 'stillHappening') {
          newCounts.stillHappeningCount += nextVal ? 1 : -1;
        } else if (gestureKey === 'canHelp') {
          newCounts.canHelpCount += nextVal ? 1 : -1;
        } else if (gestureKey === 'fixedHere') {
          newCounts.fixedHereCount += nextVal ? 1 : -1;
        } else if (gestureKey === 'followed') {
          newCounts.followers += nextVal ? 1 : -1;
        }

        // Check if user is now a contributor (only for positive civic actions)
        let newContributors = [...inc.contributorIds];
        if (gestureKey !== 'didNotSee' && nextVal && !newContributors.includes(currentUser.id)) {
          newContributors.push(currentUser.id);
          newCounts.uniqueContributors = newContributors.length;
        }

        return {
          ...inc,
          userGestures: newGestures,
          counts: newCounts,
          contributorIds: newContributors,
        };
      })
    );
  };

  // 2. Draft updates
  const updateDraft = (partial: Partial<ReportDraft>) => {
    setReportDraft((prev) => ({ ...prev, ...partial }));
  };

  const setSelectedLocation = (loc: UserSelectedLocation) => {
    setSelectedLocationState(loc);
    locationService.saveStoredLocation(loc);
  };

  const resetDraft = () => {
    setReportDraft(emptyDraft);
    setWizardStep(1);
  };

  const loadSampleDraft = () => {
    setReportDraft(sampleWalkthroughDraft);
    setWizardStep(1);
  };

  // 3. Publish Report -> creates new incident with real location & marked not sample
  const publishReport = (): IncidentRecord => {
    const categoryConfig = getCategoryById(reportDraft.categoryId);
    const incidentNum = 1056 + Math.floor(Math.random() * 50);
    const newId = `inc-${incidentNum}`;

    const reportLocality = reportDraft.location?.locality || selectedLocation?.locality || 'Neighborhood';
    const locPrefix = reportLocality.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'CIV';
    const newRef = `CS-${locPrefix}-${incidentNum}`;

    const reportCity = reportDraft.location?.city || selectedLocation?.city || '';
    const fullLocality = reportCity ? `${reportLocality}, ${reportCity}` : reportLocality;

    const newIncident: IncidentRecord = {
      id: newId,
      reference: newRef,
      reporter: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isVerified: true,
      },
      community: `c/${reportLocality}`,
      locality: fullLocality,
      createdAt: 'Just now',
      category: categoryConfig.name,
      categoryId: categoryConfig.id,
      status: 'active_unresolved',
      title: reportDraft.title,
      landmark: reportDraft.location?.landmark || reportDraft.location?.name || `${reportLocality} area`,
      description: reportDraft.description,
      evidence: reportDraft.evidence,
      location: reportDraft.location || {
        name: fullLocality,
        lat: selectedLocation ? selectedLocation.lat : 12.9716,
        lng: selectedLocation ? selectedLocation.lng : 77.5946,
        landmark: reportDraft.title,
        locality: reportLocality,
        city: reportCity || 'Local Area',
        source: 'manual',
      },
      severity: reportDraft.severity,
      stillHappening: reportDraft.stillHappening,
      isSample: false,
      counts: {
        witnesses: 1,
        affected: 1,
        evidenceItems: reportDraft.evidence.length,
        discussions: 0,
        uniqueContributors: 1,
        followers: 1,
        stillHappeningCount: 1,
        canHelpCount: 0,
        fixedHereCount: 0,
      },
      userGestures: {
        witnessed: true,
        affected: true,
        stillHappening: true,
        canHelp: false,
        fixedHere: false,
        followed: true,
      },
      aiSuggestion: {
        suggestedCategoryId: categoryConfig.id,
        suggestedTitle: reportDraft.title,
        relatedReportCount: 0,
        groupingStatus: 'none',
        matchReason: 'Original report registered. Monitoring local feed for related neighbor signals.',
      },
      contributorIds: [currentUser.id],
    };

    setIncidents((prev) => [newIncident, ...prev]);

    addTimelineEvent(newId, {
      title: 'Report Published',
      description: `${currentUser.name} submitted original photographic evidence.`,
      timestamp: 'Just now',
      actor: currentUser.name,
      type: 'report',
    });

    addNotification({
      title: `Report Published: ${newRef}`,
      body: `Your report "${reportDraft.title}" is now visible to the ${reportLocality} community feed.`,
      timestamp: 'Just now',
      linkTab: 'incident_detail',
      targetId: newId,
      type: 'status',
    });

    setCurrentIncidentId(newId);
    setActiveView('incident_detail');
    resetDraft();
    return newIncident;
  };

  // 4. Consolidate Reports
  const consolidateReports = (incidentId: string, candidateIds: string[]) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const mergedCandidates = CANDIDATE_DUPLICATE_REPORTS.filter((c) => candidateIds.includes(c.id));
        const newEvidence: EvidenceItem[] = mergedCandidates.map((c, idx) => ({
          id: `ev-merged-${c.id}`,
          url: c.evidenceUrl,
          name: `EVIDENCE_${c.originalReportId}.jpg`,
          size: '2.4 MB',
          type: 'image/jpeg',
          contributorName: c.reporterName,
          contributorAvatar: c.reporterAvatar,
          timestamp: c.timestamp,
          isSample: true,
          locationConfirmed: true,
        }));

        // Add 8 new contributors from the candidates
        const extraContributors = Array.from({ length: 8 }, (_, i) => `contrib-cand-${i + 1}`);
        const combinedContributors = Array.from(new Set([...inc.contributorIds, ...extraContributors]));
        const totalUnique = combinedContributors.length; // e.g. 42 + 8 = 50!

        return {
          ...inc,
          isConsolidated: true,
          consolidatedReportIds: [
            ...(inc.consolidatedReportIds || []),
            ...mergedCandidates.map((c) => c.originalReportId),
          ],
          evidence: [...inc.evidence, ...newEvidence],
          counts: {
            ...inc.counts,
            evidenceItems: inc.counts.evidenceItems + newEvidence.length,
            uniqueContributors: totalUnique,
            witnesses: inc.counts.witnesses + 14,
            affected: inc.counts.affected + 18,
          },
          contributorIds: combinedContributors,
          aiSuggestion: {
            ...inc.aiSuggestion,
            groupingStatus: 'reviewed',
            matchReason: `${mergedCandidates.length} candidate reports consolidated into this master incident.`,
          },
        };
      })
    );

    addTimelineEvent(incidentId, {
      title: 'Reports Consolidated',
      description: `3 candidate original reports combined into master incident. Original timestamps, photo evidence, and contributor identities preserved.`,
      timestamp: 'Just now',
      actor: `${currentUser.name} (Community Review)`,
      type: 'consolidation',
    });

    // Check if total contributors reached 50!
    const target = incidents.find((i) => i.id === incidentId);
    if (target && target.contributorIds.length + 8 >= 50) {
      simulateContributors(incidentId, 50);
    }
  };

  // 5. THRESHOLD 50 RULE: Automatic Incident Room Creation
  const simulateContributors = (incidentId: string, count: number) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newContributorIds = Array.from({ length: count }, (_, i) => `contrib-${i + 1}`);
        return {
          ...inc,
          counts: {
            ...inc.counts,
            uniqueContributors: count,
          },
          contributorIds: newContributorIds,
        };
      })
    );

    const targetIncident = incidents.find((i) => i.id === incidentId);
    if (!targetIncident) return;

    // Check threshold 50 & IDEMPOTENCY
    const existingRoom = rooms.find((r) => r.incidentId === incidentId);
    if (count >= 50 && !existingRoom) {
      const roomId = `room-${targetIncident.id.replace('inc-', '')}`;
      // Initial leader is earliest eligible verified reporter
      const earliestReporter = targetIncident.reporter;

      const newRoom: CommunityRoom = {
        id: roomId,
        incidentId: targetIncident.id,
        incidentReference: targetIncident.reference,
        title: targetIncident.title,
        category: targetIncident.category,
        location: targetIncident.location.name,
        status: 'active',
        leader: {
          id: earliestReporter.id,
          name: earliestReporter.name,
          avatar: earliestReporter.avatar,
          role: 'Community Leader (Earliest Reporter)',
          isEarliestReporter: true,
        },
        memberCount: 50,
        members: [
          {
            id: earliestReporter.id,
            name: earliestReporter.name,
            avatar: earliestReporter.avatar,
            role: 'leader',
            isEarliestReporter: true,
            joinedAt: targetIncident.createdAt,
          },
          ...DEMO_USERS.filter((u) => u.id !== earliestReporter.id).map((u) => ({
            id: u.id,
            name: u.name,
            avatar: u.avatar,
            role: 'member' as const,
            isEarliestReporter: false,
            joinedAt: '1 hour ago',
          })),
          ...Array.from({ length: 46 }, (_, i) => ({
            id: `member-${i + 1}`,
            name: `Resident ${i + 1}`,
            avatar: `R${i + 1}`,
            role: 'member' as const,
            isEarliestReporter: false,
            joinedAt: 'Today',
          })),
        ],
        createdAt: 'Just now',
        isAutomated: true,
      };

      setRooms((prev) => [...prev, newRoom]);

      // Update incident status
      setIncidents((prev) =>
        prev.map((i) => (i.id === incidentId ? { ...i, roomId, status: 'room_active' } : i))
      );

      // Add timeline
      addTimelineEvent(incidentId, {
        title: 'Community Incident Room Opened',
        description: `Threshold of 50 unique eligible contributors reached. Room "${roomId}" opened. ${earliestReporter.name} appointed initial Community Leader.`,
        timestamp: 'Just now',
        actor: 'CivicSignal Room Engine',
        type: 'room_created',
      });

      // Notification
      addNotification({
        title: `Community Room Opened: ${targetIncident.reference}`,
        body: `50 unique neighbors have corroborated "${targetIncident.title}". Dedicated incident workspace is now live!`,
        timestamp: 'Just now',
        linkTab: 'incident_room',
        targetId: roomId,
        type: 'room',
      });
    }
  };

  // 6. THRESHOLD 100 RULE: Automatic Signature Campaign at 100 Room Members
  const simulateRoomMembers = (roomId: string, count: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const currentMemberIds = r.members.map((m) => m.id);
        const needed = count - currentMemberIds.length;
        let newMembers = [...r.members];

        if (needed > 0) {
          const additional = Array.from({ length: needed }, (_, i) => ({
            id: `extra-member-${Date.now()}-${i}`,
            name: `Eligible Signatory ${currentMemberIds.length + i + 1}`,
            avatar: `S${currentMemberIds.length + i + 1}`,
            role: 'member' as const,
            isEarliestReporter: false,
            joinedAt: 'Just now',
          }));
          newMembers = [...newMembers, ...additional];
        }

        return {
          ...r,
          memberCount: count,
          members: newMembers,
        };
      })
    );

    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const incident = incidents.find((i) => i.id === room.incidentId);
    if (!incident) return;

    // Trigger Campaign at 100 members & IDEMPOTENCY
    const existingCampaign = campaigns[roomId];
    if (count >= 100 && !existingCampaign) {
      const campaignId = `camp-${roomId}`;
      const complaintId = `doc-${roomId}-v1`;
      const categoryConfig = getCategoryById(incident.categoryId);

      const allMemberIds = room.members.map((m) => m.id);

      // 1. Create Signature Campaign
      const newCampaign: SignatureCampaign = {
        id: campaignId,
        roomId,
        incidentId: incident.id,
        complaintVersion: 1,
        status: 'active',
        targetMembers: 100,
        signedMembers: [],
        declinedMembers: [],
        pendingMembers: allMemberIds,
        createdAt: 'Just now',
        policy: 'demo_strict',
      };

      // 2. Create Complaint Document
      const newComplaint: ComplaintDocument = {
        id: complaintId,
        incidentId: incident.id,
        version: 1,
        recipient: {
          name: categoryConfig.defaultRecipient.name,
          department: categoryConfig.defaultRecipient.department,
          category: categoryConfig.name,
          address: categoryConfig.defaultRecipient.address,
          isDemoRecipient: true,
        },
        subject: `FORMAL RESIDENT COMPLAINT: Urgent repair requested for ${incident.title} (${incident.reference})`,
        description: incident.description,
        reviewedLocation: {
          name: incident.location.name,
          coordinates: `${incident.location.lat}° N, ${incident.location.lng}° E`,
          landmark: incident.location.landmark,
        },
        observedDate: incident.createdAt,
        communityImpact: `Documented severe disruption affecting over ${incident.counts.affected} local residents and ${incident.counts.witnesses} direct witnesses. Cyclists and motorists are exposed to dangerous vehicular cross-traffic.`,
        evidenceIndex: incident.evidence.map((e, idx) => ({
          id: e.id,
          name: e.name,
          contributor: e.contributorName,
          date: e.timestamp,
          type: e.type,
        })),
        requestedAction:
          '1. Immediate site inspection by ward engineering staff within 48 hours.\n2. Temporary safety barricading and reflective warning markers.\n3. Complete asphalt restoration and drainage clearance.\n4. Formal written response to the community workspace.',
        signatories: [],
        status: 'awaiting_signatures',
      };

      setCampaigns((prev) => ({ ...prev, [roomId]: newCampaign }));
      setComplaintDocs((prev) => ({ ...prev, [complaintId]: newComplaint }));

      // Update room status
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: 'campaign_in_progress' } : r))
      );

      // Timeline event
      addTimelineEvent(incident.id, {
        title: 'Signature Campaign Started (100 Members Reached)',
        description: `Threshold of 100 unique eligible members reached. Formal complaint draft v1 prepared. Direct-message signature requests dispatched to all members.`,
        timestamp: 'Just now',
        actor: 'CivicSignal Campaign Engine',
        type: 'campaign_started',
      });

      // Notification to current user
      addNotification({
        title: `Signature Request: ${incident.reference}`,
        body: `100 room members reached! Review and sign the formal complaint for "${incident.title}".`,
        timestamp: 'Just now',
        linkTab: 'complaint_doc',
        targetId: complaintId,
        type: 'campaign',
      });
    }
  };

  // 7. Individual Sign & Decline Decisions (Strict consent rules)
  const signCampaignDecision = (
    campaignId: string,
    memberId: string,
    decision: 'signed' | 'declined'
  ) => {
    setCampaigns((prev) => {
      const camp = Object.values(prev).find((c) => c.id === campaignId);
      if (!camp) return prev;

      const newPending = camp.pendingMembers.filter((m) => m !== memberId);
      let newSigned = [...camp.signedMembers];
      let newDeclined = [...camp.declinedMembers];

      if (decision === 'signed') {
        if (!newSigned.includes(memberId)) newSigned.push(memberId);
        newDeclined = newDeclined.filter((m) => m !== memberId);
      } else {
        if (!newDeclined.includes(memberId)) newDeclined.push(memberId);
        newSigned = newSigned.filter((m) => m !== memberId);
      }

      const updatedCamp: SignatureCampaign = {
        ...camp,
        signedMembers: newSigned,
        declinedMembers: newDeclined,
        pendingMembers: newPending,
        status: newSigned.length >= camp.targetMembers ? 'condition_met' : 'active',
      };

      // Also update the complaint doc signatories
      const complaintKey = `doc-${camp.roomId}-v${camp.complaintVersion}`;
      setComplaintDocs((docPrev) => {
        const doc = docPrev[complaintKey];
        if (!doc) return docPrev;

        let signatories = [...doc.signatories];
        if (decision === 'signed') {
          const userObj = DEMO_USERS.find((u) => u.id === memberId) || {
            name: `Verified Member (${memberId})`,
          };
          if (!signatories.some((s) => s.memberId === memberId)) {
            signatories.push({
              memberId,
              name: userObj.name,
              timestamp: 'Just now',
              version: camp.complaintVersion,
            });
          }
        } else {
          signatories = signatories.filter((s) => s.memberId !== memberId);
        }

        const isConditionMet = updatedCamp.status === 'condition_met';

        return {
          ...docPrev,
          [complaintKey]: {
            ...doc,
            signatories,
            status: isConditionMet ? 'awaiting_leader_approval' : 'awaiting_signatures',
          },
        };
      });

      return {
        ...prev,
        [camp.roomId]: updatedCamp,
      };
    });

    // Also update room member state
    const camp = Object.values(campaigns).find((c) => c.id === campaignId);
    if (camp) {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id !== camp.roomId) return r;
          return {
            ...r,
            members: r.members.map((m) =>
              m.id === memberId
                ? {
                    ...m,
                    signatureDecision: decision,
                    signatureTimestamp: 'Just now',
                  }
                : m
            ),
          };
        })
      );
    }
  };

  // 8. Demo Simulator: Simulate All Members Signing for Rapid Testing
  const simulateAllSignatures = (campaignId: string) => {
    const camp = Object.values(campaigns).find((c) => c.id === campaignId);
    if (!camp) return;

    const room = rooms.find((r) => r.id === camp.roomId);
    if (!room) return;

    const allMembers = room.members;
    const signedIds = allMembers.map((m) => m.id);

    const updatedCamp: SignatureCampaign = {
      ...camp,
      signedMembers: signedIds,
      declinedMembers: [],
      pendingMembers: [],
      status: 'condition_met',
    };

    setCampaigns((prev) => ({ ...prev, [camp.roomId]: updatedCamp }));

    const complaintKey = `doc-${camp.roomId}-v${camp.complaintVersion}`;
    setComplaintDocs((prev) => {
      const doc = prev[complaintKey];
      if (!doc) return prev;

      const newSignatories = allMembers.map((m) => ({
        memberId: m.id,
        name: m.name,
        timestamp: '12 Oct 2026, 11:30 IST',
        version: camp.complaintVersion,
      }));

      return {
        ...prev,
        [complaintKey]: {
          ...doc,
          signatories: newSignatories,
          status: 'awaiting_leader_approval',
        },
      };
    });

    addTimelineEvent(camp.incidentId, {
      title: 'All 100 Signatures Collected',
      description: 'Signature condition satisfied. 100 unique verified member consents recorded on draft v1. Forwarded to Community Leader Ananya Sharma for final review and approval.',
      timestamp: 'Just now',
      actor: 'CivicSignal Campaign Engine',
      type: 'signature',
    });

    addNotification({
      title: 'Campaign Complete: Leader Approval Needed',
      body: '100 of 100 members signed the complaint. Community Leader review required before simulated submission.',
      timestamp: 'Just now',
      linkTab: 'leader_approval',
      targetId: complaintKey,
      type: 'campaign',
    });
  };

  // 9. Community Leader Review & Approval (Section 17)
  const approveComplaintAsLeader = (
    complaintId: string,
    decision: 'approved' | 'changes_requested',
    notes?: string
  ) => {
    setComplaintDocs((prev) => {
      const doc = prev[complaintId];
      if (!doc) return prev;

      const updated: ComplaintDocument = {
        ...doc,
        status: decision === 'approved' ? 'approved_for_send' : 'changes_requested',
        leaderApproval: {
          leaderId: currentUser.id,
          leaderName: currentUser.name,
          timestamp: 'Just now',
          decision,
          notes,
        },
      };

      addTimelineEvent(doc.incidentId, {
        title: decision === 'approved' ? 'Leader Approved Complaint' : 'Changes Requested by Leader',
        description:
          decision === 'approved'
            ? `${currentUser.name} (Community Leader) gave explicit approval to complaint v${doc.version} addressed to ${doc.recipient.name}. Ready for simulated transmission.`
            : `${currentUser.name} requested modifications before submission: "${notes || 'Review details'}"`,
        timestamp: 'Just now',
        actor: `${currentUser.name} (Community Leader)`,
        type: 'leader_approval',
      });

      return { ...prev, [complaintId]: updated };
    });
  };

  // 10. Simulated Submission (Section 17)
  const simulateSendComplaint = (complaintId: string) => {
    setComplaintDocs((prev) => {
      const doc = prev[complaintId];
      if (!doc) return prev;

      const trackingCode = `BBMP-2026-ENG-${Math.floor(1000 + Math.random() * 9000)}`;

      const updated: ComplaintDocument = {
        ...doc,
        status: 'simulated_send_completed',
        simulatedSendResult: {
          timestamp: 'Just now',
          trackingCode,
          dispatchedTo: `${doc.recipient.name} - ${doc.recipient.department}`,
          message: 'SIMULATED SUBMISSION: Dispatched through civic coordination channel mock endpoint.',
        },
      };

      // Update incident status
      setIncidents((incPrev) =>
        incPrev.map((i) =>
          i.id === doc.incidentId ? { ...i, status: 'simulated_send_completed' } : i
        )
      );

      // Add timeline
      addTimelineEvent(doc.incidentId, {
        title: 'Simulated Complaint Dispatch Completed',
        description: `Complaint v${doc.version} with ${doc.signatories.length} certified signatories sent to ${doc.recipient.name}. Mock Tracking ID: ${trackingCode}.`,
        timestamp: 'Just now',
        actor: 'CivicSignal Dispatcher (Simulated)',
        type: 'simulated_send',
      });

      // Notification
      addNotification({
        title: `Simulated Dispatch: ${trackingCode}`,
        body: `Complaint successfully transmitted to ${doc.recipient.name}. Resident tracking is active.`,
        timestamp: 'Just now',
        linkTab: 'tracking',
        targetId: doc.incidentId,
        type: 'status',
      });

      return { ...prev, [complaintId]: updated };
    });
  };

  // 11. Send Message to Incident Room
  const sendMessageToRoom = (roomId: string, content: string, imageAttachment?: string) => {
    const newMessage: RoomMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isLeader: currentUser.role === 'community_leader',
      },
      content,
      timestamp: 'Just now',
      imageAttachment,
    };

    setRoomMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));
  };

  // 12. Switch User
  const switchUser = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const resetAllDemoData = () => {
    storageService.resetAll();
    setIncidents(storageService.loadIncidents());
    setRooms(storageService.loadRooms());
    setRoomMessages(storageService.loadMessages());
    setCampaigns(storageService.loadCampaigns());
    setComplaintDocs(storageService.loadComplaints());
    setTimelineEvents(storageService.loadTimeline());
    setNotifications(storageService.loadNotifications());
    setCurrentUser(storageService.loadCurrentUser());
    resetDraft();
    setActiveView('explore');
  };

  return (
    <CivicContext.Provider
      value={{
        incidents,
        currentIncident,
        currentIncidentId,
        activeView,
        wizardStep,
        reportDraft,
        rooms,
        activeRoom,
        activeRoomId,
        roomMessages,
        campaigns,
        complaintDocs,
        timelineEvents,
        notifications,
        currentUser,
        searchQuery,
        activeCategoryFilter,
        activeFeedTab,
        isConsolidationModalOpen,
        consolidationTargetIncident,
        selectedLocation,
        selectedRadiusKm,
        isLocationModalOpen,
        includeDemoDataInFeed,
        isAiDrawerOpen,

        setActiveView,
        setCurrentIncidentId,
        setActiveRoomId,
        setWizardStep,
        setSearchQuery,
        setActiveCategoryFilter,
        setActiveFeedTab,
        setIsConsolidationModalOpen,
        setConsolidationTargetIncident,
        setCurrentUser,

        setSelectedLocation,
        setSelectedRadiusKm,
        setIsLocationModalOpen,
        setIncludeDemoDataInFeed,
        setIsAiDrawerOpen,

        toggleGesture,
        updateDraft,
        resetDraft,
        loadSampleDraft,
        publishReport,
        consolidateReports,
        sendMessageToRoom,

        simulateContributors,
        simulateRoomMembers,
        signCampaignDecision,
        simulateAllSignatures,
        approveComplaintAsLeader,
        simulateSendComplaint,
        switchUser,
        markNotificationRead,
        resetAllDemoData,
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = (): CivicContextType => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
