import { apiSlice } from './apiSlice'
import { User, UserRole } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/api-config'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  phone_number: string
  name: string
  email: string
  password: string
  user_type: UserRole
  region_name?: string
  location?: string
  lat?: number
  lng?: number
}

interface AuthResponse {
  success: boolean
  data: {
    user: User
    session_token: string
  }
  message: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.REGISTER,
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        // Just clear local storage, no API call needed
        return { data: undefined }
      },
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation, useLogoutMutation } = authApi
