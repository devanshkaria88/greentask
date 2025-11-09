'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/store'
import { setUser, setLoading } from '@/store/authSlice'
import { mockUser } from '@/lib/mock-data'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          dispatch(setUser(user))
        } catch (error) {
          console.error('Failed to parse user data:', error)
          dispatch(setLoading(false))
        }
      } else {
        dispatch(setLoading(false))
      }
    }

    checkAuth()
  }, [dispatch])

  return <>{children}</>
}
