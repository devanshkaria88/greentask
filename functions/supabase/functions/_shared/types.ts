/**
 * Shared TypeScript types for Greenmatch Edge Functions
 */

export type UserRole = 'GramPanchayat' | 'CommunityMember' | 'Admin';
export type JobStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'paid';
export type JobCategory = 'tree_planting' | 'waste_management' | 'water_conservation' | 'renewable_energy' | 'awareness' | 'other';

// Legacy aliases for backward compatibility
export type TaskStatus = JobStatus;
export type TaskCategory = JobCategory;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  role: UserRole;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  status: JobStatus;
  compensation_amount: number;
  location: string;
  lat?: number;
  long?: number;
  estimated_duration_hours?: number;
  required_participants?: number;
  verification_required: boolean;
  created_by: string;
  assigned_to?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  verified_at?: string;
}

// Legacy alias
export type Task = Job;

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  role: UserRole;
  location?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  photo_url?: string;
  location?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  category: JobCategory;
  compensation_amount: number;
  location: string;
  lat?: number;
  long?: number;
  estimated_duration_hours?: number;
  required_participants?: number;
  verification_required?: boolean;
}

// Legacy alias
export type CreateTaskRequest = CreateJobRequest;

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  category?: JobCategory;
  status?: JobStatus;
  compensation_amount?: number;
  location?: string;
  lat?: number;
  long?: number;
  estimated_duration_hours?: number;
  required_participants?: number;
  verification_required?: boolean;
  assigned_to?: string;
  verified_by?: string;
}

// Legacy alias
export type UpdateTaskRequest = UpdateJobRequest;
export type TaskApplication = JobApplication;
