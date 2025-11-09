// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:54321/functions/v1'

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  
  // User Profile
  USER_PROFILE: '/user/profile',
  
  // Jobs
  CREATE_JOB: '/jobs/create',
  MY_JOBS: '/jobs/my-jobs',
  JOB_DETAILS: '/jobs',
  UPDATE_JOB: '/jobs',
  DELETE_JOB: '/jobs',
  JOB_APPLICATIONS: '/jobs',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  CLIMATE_IMPACT: '/dashboard/climate-impact',
  
  // Submissions
  CREATE_SUBMISSION: '/submissions/create',
  PENDING_SUBMISSIONS: '/submissions/pending',
  VERIFY_SUBMISSION: '/submissions',
  SUBMISSION_DETAILS: '/submissions',
  
  // Payments
  WALLET: '/payments/wallet',
  PENDING_APPROVALS: '/payments/pending-approvals',
  APPROVE_PAYMENT: '/payments',
  
  // Applications
  ACCEPT_APPLICATION: '/applications',
  REJECT_APPLICATION: '/applications',
}

// User types
export const USER_TYPES = {
  COMMUNITY_MEMBER: 'CommunityMember',
  GRAM_PANCHAYAT: 'GramPanchayat',
  ADMIN: 'Admin',
} as const

// Job categories
export const JOB_CATEGORIES = {
  TREE_PLANTING: 'tree_planting',
  WATER_HARVESTING: 'water_harvesting',
  SOLAR_MAINTENANCE: 'solar_maintenance',
  WASTE_MANAGEMENT: 'waste_management',
} as const
