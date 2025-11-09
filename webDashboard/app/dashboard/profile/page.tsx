'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { setUser } from '@/store/authSlice'
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/store/api/userApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User, Mail, Phone, MapPin, Briefcase, Save, Loader2 } from 'lucide-react'
import { USER_TYPES } from '@/lib/api-config'
import { UserRole } from '@/lib/types'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const localUser = useAppSelector((state: any) => state.auth.user)
  const { data: profileData, isLoading: isLoadingProfile, refetch } = useGetUserProfileQuery({})
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()
  const [isEditing, setIsEditing] = useState(false)
  
  // Use API data if available, fallback to local user
  const user = profileData?.data?.user || localUser

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    user_type: 'GramPanchayat' as UserRole,
    region_name: '',
    location: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        user_type: user.user_type || 'GramPanchayat',
        region_name: user.region_name || '',
        location: user.location || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      const result = await updateProfile(formData).unwrap()
      
      // Update Redux state and localStorage
      const updatedUser = result.data.user
      dispatch(setUser(updatedUser))
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      toast.success(result.message || 'Profile updated successfully!')
      setIsEditing(false)
      refetch() // Refresh profile data
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        user_type: user.user_type || 'GramPanchayat',
        region_name: user.region_name || '',
        location: user.location || '',
      })
    }
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case USER_TYPES.GRAM_PANCHAYAT:
        return 'Gram Panchayat Official'
      case USER_TYPES.ADMIN:
        return 'Admin'
      case USER_TYPES.COMMUNITY_MEMBER:
        return 'Community Member'
      default:
        return type
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.name || 'User'}</CardTitle>
            <CardDescription>{user?.email || ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{user?.user_type ? getUserTypeLabel(user.user_type) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user?.phone_number || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{user?.location || user?.region_name || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {isEditing ? 'Update your profile details' : 'View your profile details'}
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_type">
                  <Briefcase className="inline h-4 w-4 mr-2" />
                  User Type
                </Label>
                <Select
                  value={formData.user_type}
                  onValueChange={(value) => setFormData({ ...formData, user_type: value as UserRole })}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Region/State
                </Label>
                <Input
                  id="region"
                  value={formData.region_name}
                  onChange={(e) => setFormData({ ...formData, region_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Maharashtra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Location/District
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Pune District"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Additional account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm font-medium">User ID</span>
            <span className="text-sm text-muted-foreground">{user?.id || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm font-medium">Account Created</span>
            <span className="text-sm text-muted-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm font-medium">Account Status</span>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
