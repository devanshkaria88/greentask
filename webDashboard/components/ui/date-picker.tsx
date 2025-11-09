"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  fromYear?: number
  toYear?: number
  className?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled,
  fromYear,
  toYear,
  className,
}: DatePickerProps) {
  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal cursor-pointer",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
