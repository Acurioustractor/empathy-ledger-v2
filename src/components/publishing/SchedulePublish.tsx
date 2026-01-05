'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar as CalendarIcon, Clock, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface SchedulePublishProps {
  storyId: string
  isOpen: boolean
  onClose: () => void
  onScheduled: (scheduledDate: Date) => void
}

export function SchedulePublish({ storyId, isOpen, onClose, onScheduled }: SchedulePublishProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('09:00')
  const [scheduling, setScheduling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSchedule = async () => {
    if (!date) {
      setError('Please select a date')
      return
    }

    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number)
    const scheduledDate = new Date(date)
    scheduledDate.setHours(hours, minutes, 0, 0)

    // Validate future date
    if (scheduledDate <= new Date()) {
      setError('Scheduled time must be in the future')
      return
    }

    setScheduling(true)
    setError(null)

    try {
      const response = await fetch(`/api/stories/${storyId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_at: scheduledDate.toISOString() })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to schedule story')
      }

      onScheduled(scheduledDate)
      onClose()
    } catch (error: any) {
      console.error('Error scheduling story:', error)
      setError(error.message)
    } finally {
      setScheduling(false)
    }
  }

  const getScheduledDateTime = () => {
    if (!date) return null
    const [hours, minutes] = time.split(':').map(Number)
    const scheduledDate = new Date(date)
    scheduledDate.setHours(hours, minutes, 0, 0)
    return scheduledDate
  }

  const scheduledDateTime = getScheduledDateTime()
  const isValidSchedule = scheduledDateTime && scheduledDateTime > new Date()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-2xl">Schedule Publishing</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your story will be automatically published at the scheduled time.
              You can cancel or reschedule anytime before publication.
            </AlertDescription>
          </Alert>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Publishing Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Publishing Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Preview */}
          {scheduledDateTime && (
            <div className="p-4 bg-[#F8F6F1] rounded-lg border-2 border-[#2C2C2C]/10">
              <p className="text-sm text-[#2C2C2C]/60 mb-1">Story will be published on:</p>
              <p className="font-serif text-lg font-bold text-[#2C2C2C]">
                {format(scheduledDateTime, "PPPP 'at' p")}
              </p>
              {!isValidSchedule && (
                <p className="text-xs text-red-600 mt-2">
                  Scheduled time must be in the future
                </p>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={scheduling}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!isValidSchedule || scheduling}
            className="bg-[#D97757] hover:bg-[#D97757]/90"
          >
            {scheduling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Schedule Story
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
