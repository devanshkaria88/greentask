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
