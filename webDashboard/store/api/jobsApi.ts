import { apiSlice } from './apiSlice'
import { API_ENDPOINTS } from '@/lib/api-config'

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
    
    getJobDetails: builder.query<any, string>({
      query: (jobId) => `${API_ENDPOINTS.JOB_DETAILS}/${jobId}`,
      transformResponse: (response: any) => response,
      providesTags: (_result, _error, id) => [{ type: 'Job', id }],
    }),
    
    getJobApplications: builder.query<any, string>({
      query: (jobId) => `${API_ENDPOINTS.JOB_APPLICATIONS}/${jobId}/applications`,
      transformResponse: (response: any) => response,
      providesTags: (_result, _error, id) => [{ type: 'Application', id }],
    }),
    
    createJob: builder.mutation<any, CreateJobRequest>({
      query: (job) => ({
        url: API_ENDPOINTS.CREATE_JOB,
        method: 'POST',
        body: job,
      }),
      invalidatesTags: ['Job', 'Dashboard'],
    }),
    
    updateJob: builder.mutation<any, { id: string; updates: Partial<CreateJobRequest> }>({
      query: ({ id, updates }) => ({
        url: `${API_ENDPOINTS.UPDATE_JOB}/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Job', id }, 'Job'],
    }),
    
    deleteJob: builder.mutation<any, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.DELETE_JOB}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Job', 'Dashboard'],
    }),
    
    acceptApplication: builder.mutation<any, string>({
      query: (applicationId) => ({
        url: `${API_ENDPOINTS.ACCEPT_APPLICATION}/${applicationId}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Application', 'Job'],
    }),
    
    rejectApplication: builder.mutation<any, string>({
      query: (applicationId) => ({
        url: `${API_ENDPOINTS.REJECT_APPLICATION}/${applicationId}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Application', 'Job'],
    }),
  }),
})

export const {
  useGetMyJobsQuery,
  useGetJobDetailsQuery,
  useGetJobApplicationsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} = jobsApi
