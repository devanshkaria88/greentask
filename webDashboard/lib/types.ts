// User types
export type UserRole = 'CommunityMember' | 'GramPanchayat' | 'Admin'

export interface User {
  id: string
  email: string
  name: string
  phone_number: string
  role: UserRole
  region_name?: string
  location?: string
  lat?: number
  lng?: number
  created_at: string
  updated_at: string
}

// Job types
export type JobCategory = 'Tree Planting' | 'Water Harvesting' | 'Solar Maintenance' | 'Waste Management'
export type JobStatus = 'open' | 'assigned' | 'under_review' | 'completed' | 'cancelled'

export interface Job {
  id: string
  title: string
  description: string
  category: JobCategory
  location: string
  latitude?: number
  longitude?: number
  rewardAmount: number
  deadline: string
  proofRequirements: string
  status: JobStatus
  createdBy: string
  createdAt: string
  assignedTo?: string
  assignedAt?: string
  applications?: Application[]
}

// Application types
export interface Application {
  id: string
  jobId: string
  applicantId: string
  applicantName: string
  applicantPhone: string
  appliedAt: string
  status: 'pending' | 'accepted' | 'rejected'
}

// Submission types
export interface Submission {
  id: string
  jobId: string
  job: Job
  workerId: string
  workerName: string
  workerPhone: string
  submittedAt: string
  beforePhoto: string
  afterPhoto: string
  geotagVerified: boolean
  latitude: number
  longitude: number
  notes: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  reviewedAt?: string
  reviewedBy?: string
}

// Payment types
export type PaymentStatus = 'pending_approval' | 'approved' | 'paid'

export interface Payment {
  id: string
  jobId: string
  jobTitle: string
  workerId: string
  workerName: string
  amount: number
  status: PaymentStatus
  submittedAt: string
  approvedAt?: string
  paidAt?: string
  approvedBy?: string
}

// Dashboard stats
export interface DashboardStats {
  totalJobsPosted: number
  activeJobs: number
  pendingVerifications: number
  totalAmountDistributed: number
  treesPlanted: number
  co2Offset: number
}
