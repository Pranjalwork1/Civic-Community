// CivicSignal Core Types

export type IssueMainCategory =
  | 'roads_infrastructure'
  | 'streetlighting_electrical'
  | 'drainage_sanitation'
  | 'water_utilities'
  | 'weather_damage'
  | 'public_safety_environment'
  | 'residential_society'
  | 'neighbor_shared_space'
  | 'other';

export interface IssueCategoryConfig {
  id: string;
  mainCategory: IssueMainCategory;
  name: string;
  icon: string;
  description: string;
  defaultRecipient: {
    name: string;
    department: string;
    address: string;
  };
  isUrgentHazard?: boolean;
  urgentWarning?: string;
  isMediationOriented?: boolean;
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type LocationSource = 'device' | 'geocoded' | 'map_pin' | 'manual' | 'sample';

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
  landmark: string;
  locality: string;
  city: string;
  accuracy?: string;
  capturedAt?: string;
  source: LocationSource;
  isConfirmed?: boolean;
}

export interface UserSelectedLocation {
  name: string;
  locality: string;
  city: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  accuracy?: string;
  source: LocationSource;
  isCustomManual?: boolean;
  selectedAt?: string;
}

export interface EvidenceItem {
  id: string;
  url: string;
  geotaggedUrl?: string;
  name: string;
  size: string;
  type: string;
  contributorName: string;
  contributorAvatar?: string;
  timestamp: string;
  isSample?: boolean;
  isLiveCaptured?: boolean;
  locationConfirmed?: boolean;
  locationData?: LocationData;
  hideIdentityOnOverlay?: boolean;
}

export interface CivicGestures {
  witnessed: boolean; // "I Saw It"
  didNotSee?: boolean; // "I Didn't See It" (Mutually exclusive with witnessed)
  affected: boolean;
  stillHappening: boolean;
  canHelp: boolean;
  fixedHere: boolean;
  followed: boolean;
}

export interface CivicCounts {
  witnesses: number; // "I Saw It" count
  didNotSeeCount?: number; // "I Didn't See It" count
  affected: number;
  evidenceItems: number;
  discussions: number;
  uniqueContributors: number;
  followers: number;
  stillHappeningCount: number;
  canHelpCount: number;
  fixedHereCount: number;
}

export interface AiSuggestion {
  suggestedCategoryId?: string;
  suggestedTitle?: string;
  explanation?: string;
  relatedReportCount: number;
  groupingStatus: 'none' | 'reviewed' | 'pending_review';
  matchReason?: string;
  duplicateCandidateIds?: string[];
  evidenceCompleteness?: 'complete' | 'needs_more_angles' | 'missing_landmark';
  nextRecommendedStep?: string;
}

export interface IncidentRecord {
  id: string;
  reference: string; // e.g. "CS-BSG-1042"
  reporter: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  community: string; // e.g. "c/Basavanagudi"
  locality: string; // e.g. "Basavanagudi, Bengaluru"
  createdAt: string;
  category: string; // display name e.g. "Roads & footpaths"
  categoryId: string;
  status:
    | 'active_unresolved'
    | 'room_active'
    | 'campaign_active'
    | 'complaint_generated'
    | 'awaiting_leader_approval'
    | 'simulated_send_completed'
    | 'simulated_send_failed'
    | 'resolution_verification'
    | 'resolved';
  title: string;
  landmark: string; // e.g. "BMSCE main gate · Bull Temple Road"
  description: string;
  evidence: EvidenceItem[];
  location: LocationData;
  severity: SeverityLevel;
  stillHappening: boolean;
  counts: CivicCounts;
  userGestures: CivicGestures;
  aiSuggestion: AiSuggestion;
  roomId?: string;
  isConsolidated?: boolean;
  consolidatedReportIds?: string[];
  contributorIds: string[]; // unique contributor IDs tracking towards the 50 threshold
  isSample?: boolean;
  distanceKm?: number;
}

export interface ReportDraft {
  evidence: EvidenceItem[];
  location?: LocationData;
  locationPermissionGranted: boolean;
  title: string;
  description: string;
  categoryId: string;
  severity: SeverityLevel;
  observedAt: string;
  stillHappening: boolean;
  isCompleted: boolean;
}

export interface RoomMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'contributor' | 'member';
  isEarliestReporter: boolean;
  joinedAt: string;
  signatureDecision?: 'signed' | 'declined' | 'pending';
  signatureTimestamp?: string;
}

export interface CommunityRoom {
  id: string;
  incidentId: string;
  incidentReference: string;
  title: string;
  category: string;
  location: string;
  status: 'active' | 'campaign_ready' | 'campaign_in_progress' | 'complaint_sent' | 'resolved';
  leader: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isEarliestReporter: boolean;
  };
  memberCount: number;
  members: RoomMember[];
  createdAt: string;
  isAutomated: boolean; // triggered at 50 threshold
}

export interface RoomMessage {
  id: string;
  roomId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isLeader?: boolean;
    isAi?: boolean;
  };
  content: string;
  timestamp: string;
  isPinned?: boolean;
  imageAttachment?: string;
  replies?: Array<{
    id: string;
    author: { name: string; avatar: string };
    content: string;
    timestamp: string;
  }>;
}

export interface SignatureCampaign {
  id: string;
  roomId: string;
  incidentId: string;
  complaintVersion: number;
  status: 'active' | 'condition_met' | 'closed';
  targetMembers: number;
  signedMembers: string[]; // member IDs
  declinedMembers: string[]; // member IDs
  pendingMembers: string[]; // member IDs
  createdAt: string;
  policy: 'all_required' | 'majority' | 'demo_strict';
}

export interface ComplaintDocument {
  id: string;
  incidentId: string;
  version: number;
  recipient: {
    name: string;
    department: string;
    category: string;
    address: string;
    isDemoRecipient: boolean;
  };
  subject: string;
  description: string;
  reviewedLocation: {
    name: string;
    coordinates: string;
    landmark: string;
  };
  observedDate: string;
  communityImpact: string;
  evidenceIndex: Array<{
    id: string;
    name: string;
    contributor: string;
    date: string;
    type: string;
  }>;
  requestedAction: string;
  signatories: Array<{
    memberId: string;
    name: string;
    timestamp: string;
    version: number;
  }>;
  status:
    | 'draft'
    | 'awaiting_signatures'
    | 'awaiting_leader_approval'
    | 'changes_requested'
    | 'approved_for_send'
    | 'simulated_send_completed'
    | 'simulated_send_failed';
  leaderApproval?: {
    leaderId: string;
    leaderName: string;
    timestamp: string;
    decision: 'approved' | 'changes_requested';
    notes?: string;
  };
  simulatedSendResult?: {
    timestamp: string;
    trackingCode: string;
    dispatchedTo: string;
    message: string;
  };
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  type:
    | 'report'
    | 'evidence'
    | 'consolidation'
    | 'room_created'
    | 'campaign_started'
    | 'signature'
    | 'complaint_generated'
    | 'leader_approval'
    | 'simulated_send'
    | 'resolution';
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
  targetId?: string;
  type: 'room' | 'campaign' | 'message' | 'gesture' | 'status';
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  locality: string;
  role: 'resident' | 'community_leader' | 'active_witness';
}
