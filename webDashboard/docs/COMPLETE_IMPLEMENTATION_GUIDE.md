# GreenTask Web Dashboard - Complete Implementation Guide

## Overview
This guide provides step-by-step instructions to complete the GreenTask web dashboard implementation with real API integration.

## Current Status ✅

### Completed
- ✅ Project setup with Next.js 15, TypeScript, Tailwind CSS v4
- ✅ Redux Toolkit + RTK Query configured
- ✅ Authentication system (Login & Register pages)
- ✅ Real API integration for auth endpoints
- ✅ Dashboard layout with sidebar navigation
- ✅ Dashboard home with stats (needs real API)
- ✅ Theme support (light/dark/system)
- ✅ Protected routes
- ✅ User menu and profile display

### API Configuration
- Base URL: `http://localhost:54321/functions/v1` (configurable via `.env`)
- All API endpoints defined in `/lib/api-config.ts`
- RTK Query setup in `/store/api/apiSlice.ts`

---

## Phase 4: Jobs Management 🚧

### 4.1 Update Dashboard API

**File**: `/store/api/dashboardApi.ts`

Replace mock implementation with real API:

```typescript
import { apiSlice } from './apiSlice'
import { API_ENDPOINTS } from '@/lib/api-config'

interface DashboardStats {
  total_jobs_posted: number
  active_jobs: number
  completed_jobs: number
  total_spent: number
  pending_verifications: number
}

interface ClimateImpact {
  total_trees_planted: number
  total_co2_offset_kg: number
  total_jobs_completed: number
  total_income_generated: number
  active_workers: number
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => API_ENDPOINTS.DASHBOARD_STATS,
      transformResponse: (response: any) => response.data,
      providesTags: ['Dashboard'],
    }),
    getClimateImpact: builder.query<ClimateImpact, void>({
      query: () => API_ENDPOINTS.CLIMATE_IMPACT,
      transformResponse: (response: any) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardStatsQuery, useGetClimateImpactQuery } = dashboardApi
```

### 4.2 Update Dashboard Page

**File**: `/app/dashboard/page.tsx`

Update to use both stats and climate impact:

```typescript
const { data: stats } = useGetDashboardStatsQuery()
const { data: climate } = useGetClimateImpactQuery()

// Update stat cards to use stats.total_jobs_posted, stats.active_jobs, etc.
// Update climate section to use climate.total_trees_planted, climate.total_co2_offset_kg
```

### 4.3 Create Jobs API

**File**: `/store/api/jobsApi.ts`

Replace mock with real API:

```typescript
import { apiSlice } from './apiSlice'
import { API_ENDPOINTS } from '@/lib/api-config'

interface Job {
  id: string
  title: string
  description: string
  category: string
  location: string
  lat: number
  lng: number
  reward_amount: number
  deadline: string
  proof_requirements: string
  status: string
  created_at: string
}

interface CreateJobRequest {
  title: string
  description: string
  category: string
  location: string
  lat: number
  lng: number
  reward_amount: number
  deadline: string
  proof_requirements: string
}

export const jobsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyJobs: builder.query<any, { status?: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 10 }) => {
        const params = new URLSearchParams()
        if (status && status !== 'all') params.append('status', status)
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        return `${API_ENDPOINTS.MY_JOBS}?${params.toString()}`
      },
      transformResponse: (response: any) => response,
      providesTags: ['Job'],
    }),
    
    createJob: builder.mutation<any, CreateJobRequest>({
      query: (job) => ({
        url: API_ENDPOINTS.CREATE_JOB,
        method: 'POST',
        body: job,
      }),
      invalidatesTags: ['Job', 'Dashboard'],
    }),
    
    updateJob: builder.mutation<any, { id: string; updates: Partial<Job> }>({
      query: ({ id, updates }) => ({
        url: `${API_ENDPOINTS.UPDATE_JOB}/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Job'],
    }),
    
    deleteJob: builder.mutation<any, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.DELETE_JOB}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Job', 'Dashboard'],
    }),
    
    getJobApplications: builder.query<any, string>({
      query: (jobId) => `${API_ENDPOINTS.JOB_APPLICATIONS}/${jobId}/applications`,
      transformResponse: (response: any) => response.data.applications,
      providesTags: (_result, _error, id) => [{ type: 'Application', id }],
    }),
  }),
})

export const {
  useGetMyJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useGetJobApplicationsQuery,
} = jobsApi
```

### 4.4 Create Job Form Component

**File**: `/components/jobs/CreateJobSheet.tsx`

Create a sheet/dialog for job creation:

```typescript
'use client'

import { useState } from 'react'
import { useCreateJobMutation } from '@/store/api/jobsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { JOB_CATEGORIES } from '@/lib/api-config'

interface CreateJobSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateJobSheet({ open, onOpenChange }: CreateJobSheetProps) {
  const [createJob, { isLoading }] = useCreateJobMutation()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tree_planting',
    location: '',
    lat: 0,
    lng: 0,
    reward_amount: 0,
    deadline: '',
    proof_requirements: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createJob(formData).unwrap()
      toast.success('Job created successfully!')
      onOpenChange(false)
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'tree_planting',
        location: '',
        lat: 0,
        lng: 0,
        reward_amount: 0,
        deadline: '',
        proof_requirements: '',
      })
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to create job')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add all form fields here */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          {/* Add more fields: description, category, location, lat, lng, reward_amount, deadline, proof_requirements */}
          
          <Button type="submit" disabled={isLoading} className="w-full cursor-pointer">
            {isLoading ? 'Creating...' : 'Create Job'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 4.5 Create My Jobs Page

**File**: `/app/dashboard/jobs/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useGetMyJobsQuery } from '@/store/api/jobsApi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateJobSheet } from '@/components/jobs/CreateJobSheet'
import { JobCard } from '@/components/jobs/JobCard'
import { Plus } from 'lucide-react'

export default function MyJobsPage() {
  const [status, setStatus] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const { data, isLoading } = useGetMyJobsQuery({ status })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
          <TabsTrigger value="open" className="cursor-pointer">Open</TabsTrigger>
          <TabsTrigger value="assigned" className="cursor-pointer">Assigned</TabsTrigger>
          <TabsTrigger value="under_review" className="cursor-pointer">Under Review</TabsTrigger>
          <TabsTrigger value="completed" className="cursor-pointer">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="space-y-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data?.jobs?.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateJobSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
```

### 4.6 Create Job Card Component

**File**: `/components/jobs/JobCard.tsx`

Display job information in a card format with actions.

### 4.7 Create Job Details Page

**File**: `/app/dashboard/jobs/[id]/page.tsx`

Show full job details with applications list and actions.

---

## Phase 5: Verifications 🚧

### 5.1 Create Submissions API

**File**: `/store/api/submissionsApi.ts`

```typescript
import { apiSlice } from './apiSlice'
import { API_ENDPOINTS } from '@/lib/api-config'

export const submissionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPendingSubmissions: builder.query<any, void>({
      query: () => API_ENDPOINTS.PENDING_SUBMISSIONS,
      transformResponse: (response: any) => response.data.submissions,
      providesTags: ['Submission'],
    }),
    
    getSubmissionDetails: builder.query<any, string>({
      query: (id) => `${API_ENDPOINTS.SUBMISSION_DETAILS}/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Submission', id }],
    }),
    
    verifySubmission: builder.mutation<any, { id: string; verification_status: string; rejection_reason?: string }>({
      query: ({ id, ...body }) => ({
        url: `${API_ENDPOINTS.VERIFY_SUBMISSION}/${id}/verify`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Submission', 'Payment', 'Dashboard'],
    }),
  }),
})

export const {
  useGetPendingSubmissionsQuery,
  useGetSubmissionDetailsQuery,
  useVerifySubmissionMutation,
} = submissionsApi
```

### 5.2 Create Verifications Page

**File**: `/app/dashboard/verifications/page.tsx`

List all pending submissions with review buttons.

### 5.3 Create Review Submission Page

**File**: `/app/dashboard/verifications/[id]/page.tsx`

Show submission details with before/after photos, geotag verification, and approve/reject actions.

---

## Phase 6: Payments 🚧

### 6.1 Create Payments API

**File**: `/store/api/paymentsApi.ts`

```typescript
import { apiSlice } from './apiSlice'
import { API_ENDPOINTS } from '@/lib/api-config'

export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPendingApprovals: builder.query<any, void>({
      query: () => API_ENDPOINTS.PENDING_APPROVALS,
      transformResponse: (response: any) => response.data.payments,
      providesTags: ['Payment'],
    }),
    
    approvePayment: builder.mutation<any, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.APPROVE_PAYMENT}/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Payment', 'Dashboard'],
    }),
  }),
})

export const {
  useGetPendingApprovalsQuery,
  useApprovePaymentMutation,
} = paymentsApi
```

### 6.2 Create Payments Page

**File**: `/app/dashboard/payments/page.tsx`

Show payments with tabs for pending, approved, and paid.

---

## Phase 7: Testing & Documentation 🚧

### 7.1 Test Cases

Create test file: `/docs/TEST_CASES.md`

#### Positive Test Cases
1. **Registration**
   - Register with valid government official credentials
   - Verify redirect to dashboard
   - Verify user data stored correctly

2. **Login**
   - Login with registered credentials
   - Verify session persistence
   - Verify protected routes accessible

3. **Job Creation**
   - Create job with all required fields
   - Verify job appears in "My Jobs"
   - Verify job status is "open"

4. **Job Management**
   - Update job details
   - View job applications
   - Accept application
   - Verify job status changes to "assigned"

5. **Verification**
   - View pending submissions
   - Review submission with photos
   - Approve submission
   - Verify payment created

6. **Payment**
   - View pending payments
   - Approve payment
   - Verify payment status updated

#### Negative Test Cases
1. **Registration**
   - Register with existing email
   - Register with invalid phone format
   - Register with missing required fields

2. **Login**
   - Login with wrong password
   - Login with non-existent email

3. **Job Creation**
   - Create job with missing required fields
   - Create job with invalid deadline
   - Create job with negative reward amount

4. **Verification**
   - Reject submission without reason
   - Approve submission without proper photos

### 7.2 Manual Testing Checklist

- [ ] Register new account
- [ ] Login with credentials
- [ ] Logout and verify redirect
- [ ] Create new job
- [ ] View job in list
- [ ] Edit job details
- [ ] Delete job
- [ ] View pending verifications
- [ ] Approve submission
- [ ] Reject submission with reason
- [ ] View pending payments
- [ ] Approve payment
- [ ] Test dark mode
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test sidebar collapse/expand
- [ ] Test all navigation links

### 7.3 Environment Setup

Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:54321/functions/v1
```

### 7.4 Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Additional Components Needed

### Dialog Component
**File**: `/components/ui/dialog.tsx`

Required for modals and sheets. Use Radix UI Dialog primitive.

### Tabs Component
**File**: `/components/ui/tabs.tsx`

Required for tabbed interfaces. Use Radix UI Tabs primitive.

### Alert Dialog Component
**File**: `/components/ui/alert-dialog.tsx`

Required for confirmation dialogs. Use Radix UI AlertDialog primitive.

---

## API Integration Checklist

- [x] Auth API (register, login)
- [ ] Dashboard API (stats, climate impact)
- [ ] Jobs API (CRUD operations)
- [ ] Applications API (accept, reject)
- [ ] Submissions API (pending, verify)
- [ ] Payments API (pending, approve)

---

## Best Practices

1. **Error Handling**
   - Always wrap API calls in try-catch
   - Show user-friendly error messages
   - Log errors for debugging

2. **Loading States**
   - Show loading indicators during API calls
   - Disable buttons during submission
   - Use skeleton loaders for better UX

3. **Form Validation**
   - Validate on client side before API call
   - Show field-level errors
   - Use Zod for schema validation

4. **Type Safety**
   - Define interfaces for all API responses
   - Use TypeScript strictly
   - Avoid `any` types where possible

5. **Code Organization**
   - Keep components small and focused
   - Separate business logic from UI
   - Use custom hooks for reusable logic

---

## Deployment

1. Set environment variables in production
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform
4. Ensure API base URL points to production backend

---

## Support & Maintenance

- Keep dependencies updated
- Monitor API errors
- Collect user feedback
- Iterate on UI/UX improvements

---

**Last Updated**: November 9, 2024
**Version**: 1.0.0
