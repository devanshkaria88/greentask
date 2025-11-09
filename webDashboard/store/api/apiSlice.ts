import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/lib/api-config'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Add Supabase API key (required for ALL requests)
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (apiKey) {
        headers.set('apikey', apiKey)
      }
      
      // Add auth token if available (for protected endpoints)
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Job', 'Submission', 'Payment', 'Dashboard', 'Application'],
  endpoints: () => ({}),
})
