'use client'

import { useState } from 'react'
import { useCreateJobMutation } from '@/store/api/jobsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { toast } from 'sonner'
import { JOB_CATEGORIES } from '@/lib/api-config'

interface CreateJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const [createJob, { isLoading }] = useCreateJobMutation()
  
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('12:00')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tree_planting',
    location: '',
    lat: 0,
    lng: 0,
    reward_amount: 0,
    deadline: '',
    proof_requirements: '',
  })

  const handleLatLongPaste = (e: React.ClipboardEvent<HTMLInputElement>, field: 'lat' | 'lng') => {
    const pastedText = e.clipboardData.getData('text')
    
    // Check if pasted text contains comma (lat, long format)
    if (pastedText.includes(',')) {
      e.preventDefault()
      
      const parts = pastedText.split(',').map(part => part.trim())
      if (parts.length === 2) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setFormData({
            ...formData,
            lat: lat,
            lng: lng,
          })
          toast.success('Coordinates parsed successfully!')
        } else {
          toast.error('Invalid coordinates format')
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date) {
      toast.error('Please select a deadline date')
      return
    }
    
    // Combine date and time
    const [hours, minutes] = time.split(':')
    const deadline = new Date(date)
    deadline.setHours(parseInt(hours), parseInt(minutes))
    
    const submitData = {
      ...formData,
      deadline: deadline.toISOString(),
    }
    
    try {
      await createJob(submitData).unwrap()
      toast.success('Job created successfully!')
      onOpenChange(false)
      setFormData({
        title: '',
        description: '',
        category: 'tree_planting',
        location: '',
        lat: 0,
        lng: 0,
        reward_amount: 0,
        deadline: '',
        proof_requirements: '',
      })
      setDate(undefined)
      setTime('12:00')
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to create job')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Climate Action Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Plant 50 Saplings in Village Commons"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the job..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JOB_CATEGORIES.TREE_PLANTING} className="cursor-pointer">
                    Tree Planting
                  </SelectItem>
                  <SelectItem value={JOB_CATEGORIES.WATER_HARVESTING} className="cursor-pointer">
                    Water Harvesting
                  </SelectItem>
                  <SelectItem value={JOB_CATEGORIES.SOLAR_MAINTENANCE} className="cursor-pointer">
                    Solar Maintenance
                  </SelectItem>
                  <SelectItem value={JOB_CATEGORIES.WASTE_MANAGEMENT} className="cursor-pointer">
                    Waste Management
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Reward Amount (₹) *</Label>
              <Input
                id="reward"
                type="number"
                value={formData.reward_amount}
                onChange={(e) => setFormData({ ...formData, reward_amount: Number(e.target.value) })}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Village Commons, Ward 3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude *</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                onPaste={(e) => handleLatLongPaste(e, 'lat')}
                placeholder="22.561538"
                required
              />
              <p className="text-xs text-muted-foreground">
                Tip: Paste "lat, long" format to auto-fill both
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lng">Longitude *</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                onPaste={(e) => handleLatLongPaste(e, 'lng')}
                placeholder="70.421680"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deadline *</Label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                date={date}
                onSelect={setDate}
                placeholder="Pick a date"
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 10}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
              
              <TimePicker value={time} onChange={setTime} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Proof Requirements *</Label>
            <Textarea
              id="proof"
              value={formData.proof_requirements}
              onChange={(e) => setFormData({ ...formData, proof_requirements: e.target.value })}
              placeholder="e.g., Before and after photos with geotag required"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
