'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  HelpCircle, 
  Send, 
  Mic, 
  MicOff, 
  Phone, 
  Mail, 
  FileText, 
  Search, 
  BookOpen, 
  Video,
  Headphones,
  Clock,
  User,
  Bot,
  Paperclip,
  X,
  Minimize2,
  Maximize2,
  Settings,
  Star,
  ThumbsUp,
  Zap
} from 'lucide-react'

interface HelpMessage {
  id: string
  type: 'user' | 'admin' | 'bot'
  content: string
  timestamp: Date
  audioUrl?: string
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
  status?: 'sent' | 'delivered' | 'read'
}

interface HelpTicket {
  id: string
  subject: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: Date
  last_updated: Date
  message_count: number
}

export default function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<HelpMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [tickets, setTickets] = useState<HelpTicket[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  // Mock initial data
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: "Hi! I'm your AI assistant. I'm here to help with any questions about the platform. You can also record a voice message or submit a formal help ticket if needed!",
        timestamp: new Date(Date.now() - 1000 * 60 * 5)
      }
    ])
    
    setTickets([
      {
        id: '1',
        subject: 'Issue with story publishing',
        category: 'technical',
        priority: 'medium',
        status: 'in_progress',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        last_updated: new Date(Date.now() - 1000 * 60 * 30),
        message_count: 3
      }
    ])
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: HelpMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse: HelpMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(newMessage),
        timestamp: new Date(),
        status: 'delivered'
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('story') || lowerMessage.includes('publish')) {
      return "I can help with story publishing! To publish a story: 1) Go to Stories > Create, 2) Write your story, 3) Select visibility settings, 4) Click Publish. Need help with a specific step?"
    } else if (lowerMessage.includes('media') || lowerMessage.includes('photo') || lowerMessage.includes('video')) {
      return "For media management, visit your Media Hub from the storyteller dashboard. You can upload, organize, and control visibility of all your photos and videos there. Would you like a walkthrough?"
    } else if (lowerMessage.includes('profile') || lowerMessage.includes('edit')) {
      return "To edit your profile: 1) Click your name/avatar, 2) Select 'Edit Profile', 3) Update your information, 4) Save changes. You can also access this from your storyteller dashboard."
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to help! You can ask me questions, record a voice message for admins, or submit a formal help ticket. What specific area do you need assistance with?"
    } else {
      return "Thanks for your question! While I try to help with common issues, for more specific support, consider recording a voice message or submitting a help ticket. Is there something specific about the platform I can help with?"
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const audioMessage: HelpMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: 'Voice message sent to admin team',
          timestamp: new Date(),
          audioUrl,
          status: 'sent'
        }
        
        setMessages(prev => [...prev, audioMessage])
        
        // Auto-response for voice messages
        setTimeout(() => {
          const botResponse: HelpMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: "Your voice message has been sent to our admin team! They'll listen to it and get back to you soon. Is there anything else I can help with right now?",
            timestamp: new Date()
          }
          setMessages(prev => [...prev, botResponse])
        }, 1000)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 w-14 h-14"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="h-full flex flex-col shadow-2xl border-2 border-orange-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-gray-900">Support & Help</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 m-2">
                <TabsTrigger value="chat" className="text-xs">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="tickets" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Tickets
                </TabsTrigger>
                <TabsTrigger value="help" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Help
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex-1 flex flex-col mx-2 mb-2">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4 p-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          message.type === 'user' 
                            ? 'bg-orange-600 text-white rounded-l-lg rounded-tr-lg' 
                            : message.type === 'bot'
                            ? 'bg-blue-50 text-gray-900 border rounded-r-lg rounded-tl-lg'
                            : 'bg-green-50 text-gray-900 border rounded-r-lg rounded-tl-lg'
                        } p-3`}>
                          <div className="flex items-start gap-2">
                            {message.type !== 'user' && (
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-gray-100 text-xs">
                                  {message.type === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1">
                              <p className="text-sm">{message.content}</p>
                              {message.audioUrl && (
                                <div className="mt-2">
                                  <audio controls className="w-full h-8">
                                    <source src={message.audioUrl} type="audio/wav" />
                                  </audio>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs opacity-70 mt-1 text-right">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-r-lg rounded-tl-lg p-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t pt-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Ask a question..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      className="flex-shrink-0"
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {isRecording && (
                    <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Recording... Click mic to stop
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tickets Tab */}
              <TabsContent value="tickets" className="flex-1 mx-2 mb-2">
                <div className="space-y-4">
                  <Button className="w-full" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Submit New Ticket
                  </Button>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Your Tickets</h4>
                    {tickets.map((ticket) => (
                      <Card key={ticket.id} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm truncate">{ticket.subject}</h5>
                          <Badge variant={
                            ticket.status === 'open' ? 'destructive' :
                            ticket.status === 'in_progress' ? 'default' :
                            ticket.status === 'resolved' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {ticket.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>#{ticket.id} • {ticket.category}</span>
                          <span>{ticket.message_count} messages</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Help Tab */}
              <TabsContent value="help" className="flex-1 mx-2 mb-2">
                <ScrollArea className="h-full">
                  <div className="space-y-4 p-2">
                    <div className="text-center py-4">
                      <BookOpen className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">How can we help?</h3>
                      <p className="text-sm text-gray-600">Quick answers to common questions</p>
                    </div>

                    <div className="space-y-3">
                      <Card className="p-3 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">How to publish a story</h4>
                            <p className="text-xs text-gray-600">Step-by-step guide for story creation</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-3 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <Video className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">Managing your media</h4>
                            <p className="text-xs text-gray-600">Upload and organize photos and videos</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-3 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">Profile settings</h4>
                            <p className="text-xs text-gray-600">Update your information and preferences</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-3 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-orange-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">AI Story Creator</h4>
                            <p className="text-xs text-gray-600">Using AI to help write your stories</p>
                          </div>
                        </div>
                      </Card>

                      <div className="border-t pt-3 mt-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-3">Still need help?</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Mail className="w-3 h-3 mr-1" />
                              Email Us
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Phone className="w-3 h-3 mr-1" />
                              Schedule Call
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </Card>
    </div>
  )
}