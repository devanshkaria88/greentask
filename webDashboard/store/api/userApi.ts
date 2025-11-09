import { apiSlice } from './apiSlice'
import { API_ENDPOINTS } from '@/lib/api-config'

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => ({
        url: API_ENDPOINTS.USER_PROFILE,
        method: 'GET',
      }),
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.USER_PROFILE,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
})

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userApi
