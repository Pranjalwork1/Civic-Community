import { IssueCategoryConfig } from '../types';

export const ISSUE_CATEGORIES: IssueCategoryConfig[] = [
  // 1. Roads and public infrastructure
  {
    id: 'roads_footpaths',
    mainCategory: 'roads_infrastructure',
    name: 'Roads & footpaths',
    icon: 'Road',
    description: 'Potholes, broken footpaths, damaged dividers, manhole covers, and road subsidence',
    defaultRecipient: {
      name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
      department: 'Road Infrastructure & Engineering Division',
      address: 'Corporation Building, N.R. Square, Bengaluru 560002',
    },
  },
  // 2. Streetlights and electrical hazards
  {
    id: 'streetlighting_electrical',
    mainCategory: 'streetlighting_electrical',
    name: 'Street lighting & electrical hazards',
    icon: 'Zap',
    description: 'Streetlights out, leaning poles, fallen cables, and exposed electrical wires',
    defaultRecipient: {
      name: 'BESCOM South Division',
      department: 'Public Lighting & Distribution Maintenance',
      address: 'K.R. Road, Basavanagudi, Bengaluru 560004',
    },
    isUrgentHazard: true,
    urgentWarning:
      'CRITICAL SAFETY NOTICE: Do not approach fallen cables, leaning poles, or sparking equipment. Maintain a safe distance of at least 10 metres. Call Emergency 1912 immediately.',
  },
  // 3. Drainage, sewage, and sanitation
  {
    id: 'waste_sanitation',
    mainCategory: 'drainage_sanitation',
    name: 'Waste & sanitation',
    icon: 'Trash2',
    description: 'Overflowing waste bins, missed collection, dirty public areas, and illegal dumping',
    defaultRecipient: {
      name: 'BBMP Solid Waste Management (SWM)',
      department: 'South Zone Sanitation & Public Health',
      address: 'Basavanagudi Ward Office, Ward 154, Bengaluru',
    },
  },
  {
    id: 'drainage_sewage',
    mainCategory: 'drainage_sanitation',
    name: 'Drainage & sewage overflow',
    icon: 'Waves',
    description: 'Blocked stormwater drains, sewage overflow, broken drain covers, and flooded streets',
    defaultRecipient: {
      name: 'BWSSB Basavanagudi Service Station',
      department: 'Wastewater & Sewerage Network Division',
      address: 'Gandhi Bazaar Main Road, Basavanagudi, Bengaluru',
    },
  },
  // 4. Water supply and utilities
  {
    id: 'water_supply',
    mainCategory: 'water_utilities',
    name: 'Water supply & leaks',
    icon: 'Droplets',
    description: 'Burst pipelines, public tap leakage, interrupted supply, and drinking water concerns',
    defaultRecipient: {
      name: 'Bangalore Water Supply and Sewerage Board (BWSSB)',
      department: 'Water Distribution & Pipeline Maintenance',
      address: 'Cauvery Bhavan, K.G. Road, Bengaluru 560009',
    },
  },
  // 5. Weather-related damage
  {
    id: 'weather_damage',
    mainCategory: 'weather_damage',
    name: 'Weather-related damage',
    icon: 'CloudRain',
    description: 'Fallen trees, waterlogging after heavy rain, damaged public structures, and storm debris',
    defaultRecipient: {
      name: 'Disaster Response & Forest Cell (BBMP)',
      department: 'Emergency Tree & Monsoon Crisis Response',
      address: 'Hudson Circle Office, Bengaluru 560001',
    },
    isUrgentHazard: true,
    urgentWarning:
      'MONSOON HAZARD: Watch out for hidden potholes submerged under standing water and fallen power lines concealed by tree branches.',
  },
  // 6. Public safety & environmental concerns
  {
    id: 'public_safety',
    mainCategory: 'public_safety_environment',
    name: 'Public safety & environment',
    icon: 'ShieldAlert',
    description: 'Dangerous road obstructions, broken safety barriers, open construction trenches, and excessive smoke',
    defaultRecipient: {
      name: 'Bengaluru Traffic Police & BBMP Traffic Engineering Cell',
      department: 'Civic Safety Operations',
      address: 'Basavanagudi Traffic Station, Bengaluru',
    },
  },
  // 7. Residential society and apartment problems
  {
    id: 'residential_society',
    mainCategory: 'residential_society',
    name: 'Residential society & apartment',
    icon: 'Building2',
    description: 'Broken lifts, common staircase lights, entrance gates, basement waterlogging, and RWA maintenance',
    defaultRecipient: {
      name: 'Basavanagudi Heights Apartment Owners Association (RWA)',
      department: 'Facility Management & Maintenance Committee',
      address: 'Management Office, Basement 1, BMSCE Road, Basavanagudi',
    },
  },
  // 8. Neighbor and shared-space concerns
  {
    id: 'neighbor_shared_space',
    mainCategory: 'neighbor_shared_space',
    name: 'Neighbor & shared-space dispute',
    icon: 'Users2',
    description: 'Persistent noise, shared driveway blockages, common parking disputes, and shared-space mediation',
    defaultRecipient: {
      name: 'Community Mediation & Resident Welfare Committee',
      department: 'Basavanagudi Ward Civic Harmony Group',
      address: 'Ward Office Community Mediation Desk, Bengaluru',
    },
    isMediationOriented: true,
  },
  // 9. Other
  {
    id: 'other_civic',
    mainCategory: 'other',
    name: 'Other civic concern',
    icon: 'HelpCircle',
    description: 'Other issues not listed above requiring neighborhood collaboration or authority review',
    defaultRecipient: {
      name: 'CivicSignal Community Helpdesk',
      department: 'Ward Citizen Liaison Officer',
      address: 'Basavanagudi Citizen Center, Bengaluru',
    },
  },
];

export function getCategoryById(id: string): IssueCategoryConfig {
  const found = ISSUE_CATEGORIES.find((c) => c.id === id);
  return (
    found || {
      id: 'other_civic',
      mainCategory: 'other',
      name: 'General civic issue',
      icon: 'HelpCircle',
      description: 'Civic issue',
      defaultRecipient: {
        name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
        department: 'Ward Office',
        address: 'Basavanagudi Ward 154, Bengaluru',
      },
    }
  );
}
