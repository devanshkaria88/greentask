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
