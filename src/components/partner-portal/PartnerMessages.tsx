'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Send,
  Search,
  User,
  Clock,
  Check,
  CheckCheck,
  ChevronLeft,
  FileText,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface Message {
  id: string
  thread_id: string
  sender_type: 'partner' | 'storyteller'
  content: string
  created_at: string
  is_read: boolean
}

interface Thread {
  id: string
  storyteller: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  story?: {
    id: string
    title: string
  }
  last_message: string
  last_message_at: string
  unread_count: number
}

interface MessageTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
}

interface PartnerMessagesProps {
  appId: string
}

export function PartnerMessages({ appId }: PartnerMessagesProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchThreads()
    fetchTemplates()
  }, [appId])

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id)
    }
  }, [selectedThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchThreads() {
    setLoading(true)
    try {
      const response = await fetch(`/api/partner/messages?app_id=${appId}`)
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads || [])
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages(threadId: string) {
    try {
      const response = await fetch(`/api/partner/messages/thread/${threadId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  async function fetchTemplates() {
    try {
      const response = await fetch('/api/partner/messages/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  async function sendMessage() {
    if (!selectedThread || !newMessage.trim()) return

    setSendingMessage(true)
    try {
      const response = await fetch('/api/partner/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: selectedThread.id,
          storyteller_id: selectedThread.storyteller.id,
          content: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedThread.id)
        fetchThreads() // Refresh thread list
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  function applyTemplate(template: MessageTemplate) {
    // Replace variables with placeholders
    let content = template.content
      .replace(/\{\{storyteller_name\}\}/g, selectedThread?.storyteller.display_name || '[Storyteller]')
      .replace(/\{\{story_title\}\}/g, selectedThread?.story?.title || '[Story]')
      .replace(/\{\{partner_name\}\}/g, 'Your Organization') // Would come from context

    setNewMessage(content)
    setShowTemplates(false)
  }

  // Mock data for demo
  const mockThreads: Thread[] = [
    {
      id: 't1',
      storyteller: {
        id: 'st1',
        display_name: 'Maria Thompson',
        avatar_url: null
      },
      story: {
        id: 's1',
        title: 'Climate Journey'
      },
      last_message: 'Thank you for reaching out! I\'m happy for my story to be featured.',
      last_message_at: '2024-01-15T14:30:00Z',
      unread_count: 1
    },
    {
      id: 't2',
      storyteller: {
        id: 'st2',
        display_name: 'David Kim',
        avatar_url: null
      },
      story: {
        id: 's2',
        title: 'Finding Home'
      },
      last_message: 'Could you tell me more about how the story will be used?',
      last_message_at: '2024-01-14T10:15:00Z',
      unread_count: 0
    },
    {
      id: 't3',
      storyteller: {
        id: 'st3',
        display_name: 'Sam Lee',
        avatar_url: null
      },
      last_message: 'I\'d like to discuss the upcoming campaign.',
      last_message_at: '2024-01-12T16:45:00Z',
      unread_count: 2
    }
  ]

  const mockMessages: Message[] = [
    {
      id: 'm1',
      thread_id: 't1',
      sender_type: 'partner',
      content: 'Hi Maria, we\'d love to feature your "Climate Journey" story in our Climate Justice project. This would help amplify your voice and reach a wider audience.',
      created_at: '2024-01-15T12:00:00Z',
      is_read: true
    },
    {
      id: 'm2',
      thread_id: 't1',
      sender_type: 'storyteller',
      content: 'Thank you for reaching out! I\'m happy for my story to be featured. I\'ve approved the request through my dashboard.',
      created_at: '2024-01-15T14:30:00Z',
      is_read: true
    }
  ]

  const mockTemplates: MessageTemplate[] = [
    {
      id: 'tmp1',
      name: 'Story Feature Request',
      subject: 'Request to feature your story',
      content: 'Hi {{storyteller_name}},\n\nWe\'d love to feature your story "{{story_title}}" in our project.\n\nThis would help amplify your voice and reach a wider audience through our platform.\n\nBest regards,\n{{partner_name}}',
      category: 'request'
    },
    {
      id: 'tmp2',
      name: 'Thank You',
      subject: 'Thank you for sharing',
      content: 'Hi {{storyteller_name}},\n\nWe wanted to express our sincere gratitude for allowing us to feature your story "{{story_title}}".\n\nStories like yours help create understanding and drive positive change.\n\nWith gratitude,\n{{partner_name}}',
      category: 'thank_you'
    }
  ]

  const displayThreads = threads.length > 0 ? threads : mockThreads
  const displayMessages = messages.length > 0 ? messages : mockMessages
  const displayTemplates = templates.length > 0 ? templates : mockTemplates

  return (
    <div className="h-[calc(100vh-200px)] flex">
      {/* Thread List */}
      <div className={`w-full md:w-80 border-r border-stone-200 flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-sage-600" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-sage-600" />
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {displayThreads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThread?.id === thread.id}
                  onClick={() => setSelectedThread(thread)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message View */}
      <div className={`flex-1 flex flex-col ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-stone-200 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSelectedThread(null)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedThread.storyteller.avatar_url || undefined} />
                <AvatarFallback className="bg-sage-100 text-sage-700">
                  {selectedThread.storyteller.display_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-stone-900">
                  {selectedThread.storyteller.display_name}
                </h3>
                {selectedThread.story && (
                  <p className="text-sm text-stone-500 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {selectedThread.story.title}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {displayMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    storytellerName={selectedThread.storyteller.display_name}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-stone-200">
              {showTemplates && (
                <div className="mb-4 p-3 bg-stone-50 rounded-lg">
                  <h4 className="text-sm font-medium text-stone-700 mb-2">Templates</h4>
                  <div className="space-y-2">
                    {displayTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="w-full text-left p-2 rounded hover:bg-stone-100 text-sm"
                      >
                        <span className="font-medium">{template.name}</span>
                        <span className="text-stone-500 ml-2">({template.category})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        sendMessage()
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplates(!showTemplates)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-sage-600 hover:bg-sage-700"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-2">
                Press Cmd+Enter to send
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-400">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ThreadItem({
  thread,
  isSelected,
  onClick
}: {
  thread: Thread
  isSelected: boolean
  onClick: () => void
}) {
  const timeAgo = formatTimeAgo(new Date(thread.last_message_at))

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-stone-50 transition-colors ${
        isSelected ? 'bg-sage-50 border-l-2 border-sage-600' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={thread.storyteller.avatar_url || undefined} />
          <AvatarFallback className="bg-sage-100 text-sage-700">
            {thread.storyteller.display_name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-stone-900 truncate">
              {thread.storyteller.display_name}
            </h4>
            <span className="text-xs text-stone-400 flex-shrink-0">
              {timeAgo}
            </span>
          </div>
          {thread.story && (
            <p className="text-xs text-sage-600 truncate">
              Re: {thread.story.title}
            </p>
          )}
          <p className="text-sm text-stone-500 truncate mt-1">
            {thread.last_message}
          </p>
        </div>
        {thread.unread_count > 0 && (
          <Badge className="bg-sage-600 text-white flex-shrink-0">
            {thread.unread_count}
          </Badge>
        )}
      </div>
    </button>
  )
}

function MessageBubble({
  message,
  storytellerName
}: {
  message: Message
  storytellerName: string
}) {
  const isPartner = message.sender_type === 'partner'
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={`flex ${isPartner ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isPartner ? 'order-1' : ''}`}>
        <div
          className={`rounded-lg p-3 ${
            isPartner
              ? 'bg-sage-600 text-white'
              : 'bg-stone-100 text-stone-900'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-stone-400 ${
          isPartner ? 'justify-end' : ''
        }`}>
          <span>{isPartner ? 'You' : storytellerName}</span>
          <span>•</span>
          <span>{time}</span>
          {isPartner && (
            message.is_read ? (
              <CheckCheck className="h-3 w-3 text-sage-500" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default PartnerMessages
