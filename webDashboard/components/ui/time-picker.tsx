"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, minutes] = value.split(':')
  
  const handleHourChange = (hour: string) => {
    onChange(`${hour.padStart(2, '0')}:${minutes}`)
  }
  
  const handleMinuteChange = (minute: string) => {
    onChange(`${hours}:${minute.padStart(2, '0')}`)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal cursor-pointer",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || "Pick a time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Hour</label>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <Button
                  key={hour}
                  variant={hours === hour.toString().padStart(2, '0') ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => handleHourChange(hour.toString())}
                >
                  {hour.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Minute</label>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                <Button
                  key={minute}
                  variant={minutes === minute.toString().padStart(2, '0') ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => handleMinuteChange(minute.toString())}
                >
                  {minute.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
