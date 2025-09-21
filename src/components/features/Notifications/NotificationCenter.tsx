'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  MessageSquare,
  Heart,
  UserPlus,
  BookOpen,
  Award,
  AlertCircle,
  Info,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export interface Notification {
  id: string
  type: 'story' | 'comment' | 'like' | 'follow' | 'achievement' | 'system' | 'alert'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  avatar?: string
  metadata?: any
}

// Mock notifications store
const useNotificationsStore = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'story',
      title: 'New Story Published',
      message: 'Sarah Johnson published "Finding My Voice Through Traditional Songs"',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      read: false,
      actionUrl: '/stories/1',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: '2',
      type: 'comment',
      title: 'New Comment',
      message: 'John Doe commented on your story "The Sacred Journey"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/stories/2',
    },
    {
      id: '3',
      type: 'like',
      title: 'Story Liked',
      message: '5 people liked your story "Community Responsibility"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      actionUrl: '/stories/3',
    },
    {
      id: '4',
      type: 'follow',
      title: 'New Follower',
      message: 'Emma Wilson started following you',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      actionUrl: '/profile/emma-wilson',
      avatar: '/placeholder-avatar-2.jpg'
    },
    {
      id: '5',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Prolific Writer" badge for publishing 10 stories',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
    },
    {
      id: '6',
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to the story editor',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    }
  ])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random()
      if (random > 0.95) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'story',
          title: 'New Story Activity',
          message: 'Someone just viewed your latest story',
          timestamp: new Date(),
          read: false,
        }
        setNotifications(prev => [newNotification, ...prev])
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length
  }
}

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  const icons = {
    story: BookOpen,
    comment: MessageSquare,
    like: Heart,
    follow: UserPlus,
    achievement: Award,
    system: Info,
    alert: AlertCircle,
  }
  const Icon = icons[type]
  const colours = {
    story: 'text-blue-600 bg-blue-100',
    comment: 'text-green-600 bg-green-100',
    like: 'text-red-600 bg-red-100',
    follow: 'text-purple-600 bg-purple-100',
    achievement: 'text-yellow-600 bg-yellow-100',
    system: 'text-grey-600 bg-grey-100',
    alert: 'text-orange-600 bg-orange-100',
  }

  return (
    <div className={cn('p-2 rounded-lg', colours[type])}>
      <Icon className="h-4 w-4" />
    </div>
  )
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    unreadCount 
  } = useNotificationsStore()

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 w-5 p-0 flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={markAllAsRead}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearAll} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-grey-500">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      'p-4 hover:bg-grey-50 cursor-pointer transition-colours relative',
                      !notification.read && 'bg-blue-50/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <NotificationIcon type={notification.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-grey-600 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-grey-400 mt-1">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button variant="ghost" className="w-full text-sm" onClick={() => setOpen(false)}>
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Export a hook for programmatic notifications
export const useNotifications = () => {
  const showNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // In a real app, this would add to the global store
    console.log('New notification:', notification)
  }

  return { showNotification }
}