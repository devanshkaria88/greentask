'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoginMutation } from '@/store/api/authApi'
import { useAppDispatch } from '@/store/store'
import { setUser } from '@/store/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await login({ email, password }).unwrap()
      
      // Store token and user in localStorage
      localStorage.setItem('token', result.data.session_token)
      localStorage.setItem('user', JSON.stringify(result.data.user))
      
      // Update Redux state
      dispatch(setUser(result.data.user))
      
      toast.success(result.message || 'Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error?.data?.error || error?.error || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">GreenTask</CardTitle>
          <CardDescription>
            Climate Action Dashboard for Government Officials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="official@GreenTask.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full cursor-pointer" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="text-primary hover:underline cursor-pointer font-medium"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
