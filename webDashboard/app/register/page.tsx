'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRegisterMutation } from '@/store/api/authApi'
import { useAppDispatch } from '@/store/store'
import { setUser } from '@/store/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Leaf, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { USER_TYPES } from '@/lib/api-config'
import { UserRole } from '@/lib/types'

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    user_type: 'GramPanchayat' as UserRole,
    region_name: '',
    location: '',
    lat: 0,
    lng: 0,
  })

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Please enter your name')
          return false
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          toast.error('Please enter a valid email')
          return false
        }
        if (!formData.phone_number.trim()) {
          toast.error('Please enter your phone number')
          return false
        }
        return true
      case 2:
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        return true
      case 3:
        if (!formData.user_type) {
          toast.error('Please select a user type')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    // Validate all fields are filled (including optional ones for better UX)
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone_number.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const { confirmPassword, ...registrationData } = formData

    try {
      const result = await register(registrationData).unwrap()

      // Store token and user in localStorage
      localStorage.setItem('token', result.data.session_token)
      localStorage.setItem('user', JSON.stringify(result.data.user))

      // Update Redux state
      dispatch(setUser(result.data.user))

      toast.success(result.message || 'Registration successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error?.data?.error || error?.error || 'Registration failed. Please try again.')
    }
  }

  const totalSteps = 4

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Step {currentStep} of {totalSteps} - Register as a Government Official
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="official@GreenTask.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+919876543210"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Password */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a secure password (min 6 characters)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      autoFocus
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
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: User Type */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="user_type">User Type *</Label>
                  <Select
                    value={formData.user_type}
                    onValueChange={(value) => setFormData({ ...formData, user_type: value as UserRole })}
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USER_TYPES.GRAM_PANCHAYAT} className="cursor-pointer">
                        Gram Panchayat Official
                      </SelectItem>
                      <SelectItem value={USER_TYPES.ADMIN} className="cursor-pointer">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select your role in the climate action program
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Location (Optional) */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="region">Region/State (Optional)</Label>
                  <Input
                    id="region"
                    type="text"
                    placeholder="Maharashtra"
                    value={formData.region_name}
                    onChange={(e) => setFormData({ ...formData, region_name: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location/District (Optional)</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Pune District"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This helps us show relevant jobs in your area
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 cursor-pointer"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-primary hover:underline cursor-pointer font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
