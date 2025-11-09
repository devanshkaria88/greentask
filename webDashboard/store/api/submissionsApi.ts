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
