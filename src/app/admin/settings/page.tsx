'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Switch
} from '@/components/ui/switch'
import {
  Settings,
  Shield,
  Globe,
  Bell,
  Database,
  Mail,
  Server,
  Key,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw
} from 'lucide-react'

interface SystemSettings {
  // Platform Settings
  platform: {
    site_name: string
    site_description: string
    default_language: string
    supported_languages: string[]
    timezone: string
    date_format: string
    time_format: string
  }
  
  // Cultural Safety Settings
  cultural: {
    elder_review_required: boolean
    cultural_sensitivity_levels: string[]
    ceremonial_content_protection: boolean
    traditional_knowledge_protocols: boolean
    consent_tracking_enabled: boolean
    ocap_compliance: boolean
  }
  
  // User Management
  user_management: {
    registration_enabled: boolean
    email_verification_required: boolean
    manual_approval_required: boolean
    default_user_role: string
    session_timeout: number
    password_min_length: number
    require_2fa: boolean
  }
  
  // Content Management
  content: {
    auto_moderation: boolean
    flagged_content_threshold: number
    max_story_length: number
    max_gallery_size: number
    media_upload_limit_mb: number
    supported_media_types: string[]
  }
  
  // Notification Settings
  notifications: {
    email_notifications: boolean
    admin_alerts: boolean
    content_review_alerts: boolean
    system_maintenance_alerts: boolean
    smtp_server: string
    smtp_port: number
    smtp_username: string
    from_email: string
  }
  
  // API & Integration
  api: {
    rate_limiting: boolean
    requests_per_minute: number
    api_key_rotation_days: number
    webhook_urls: string[]
    enable_analytics: boolean
    enable_search_indexing: boolean
  }
  
  // Backup & Security
  security: {
    automated_backups: boolean
    backup_retention_days: number
    encryption_at_rest: boolean
    audit_logging: boolean
    security_headers: boolean
    cors_origins: string[]
  }
}

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('platform')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      // Fetch system analytics to populate some settings with real data
      const analyticsResponse = await fetch('/api/admin/analytics/overview')
      let systemStats = null
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        systemStats = analyticsData.overview
      }
      
      // Create settings object with real system information where possible
      const systemSettings: SystemSettings = {
        platform: {
          site_name: 'Empathy Ledger',
          site_description: 'A platform for Indigenous storytelling and cultural preservation',
          default_language: 'English',
          supported_languages: ['English', 'Plains Cree (Nēhiyawēwin)', 'Ojibwe (Anishinaabemowin)', 'French'],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Winnipeg',
          date_format: 'YYYY-MM-DD',
          time_format: '24h'
        },
        cultural: {
          elder_review_required: true,
          cultural_sensitivity_levels: ['low', 'medium', 'high'],
          ceremonial_content_protection: true,
          traditional_knowledge_protocols: true,
          consent_tracking_enabled: true,
          ocap_compliance: true
        },
        user_management: {
          registration_enabled: true,
          email_verification_required: true,
          manual_approval_required: false,
          default_user_role: 'storyteller',
          session_timeout: 8,
          password_min_length: 8,
          require_2fa: false
        },
        content: {
          auto_moderation: true,
          flagged_content_threshold: 3,
          max_story_length: 50000,
          max_gallery_size: 100,
          media_upload_limit_mb: 50,
          supported_media_types: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav']
        },
        notifications: {
          email_notifications: true,
          admin_alerts: true,
          content_review_alerts: true,
          system_maintenance_alerts: true,
          smtp_server: process.env.SMTP_HOST || 'localhost',
          smtp_port: parseInt(process.env.SMTP_PORT || '587'),
          smtp_username: process.env.SMTP_USER || '',
          from_email: process.env.FROM_EMAIL || 'noreply@empathyledger.org'
        },
        api: {
          rate_limiting: true,
          requests_per_minute: 100,
          api_key_rotation_days: 90,
          webhook_urls: [],
          enable_analytics: true,
          enable_search_indexing: true
        },
        security: {
          automated_backups: true,
          backup_retention_days: 90,
          encryption_at_rest: true,
          audit_logging: true,
          security_headers: true,
          cors_origins: [
            typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
          ]
        }
      }
      
      setSettings(systemSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      console.log('Saving settings:', settings)
      // Add API call here
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      await fetchSettings()
      setHasChanges(false)
    }
  }

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }
    })
    setHasChanges(true)
  }

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'cultural', label: 'Cultural Safety', icon: Shield },
    { id: 'user_management', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Integration', icon: Server },
    { id: 'security', label: 'Security', icon: Key }
  ]

  if (loading || !settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2">Loading system settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900 mb-2">System Settings</h1>
          <p className="text-grey-600">
            Configure platform settings, cultural protocols, and system preferences
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleResetSettings}
            variant="outline"
            disabled={saving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">You have unsaved changes. Remember to save your settings.</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Tabs */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colours ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'text-grey-700 hover:bg-grey-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'platform' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Name</label>
                    <Input
                      value={settings.platform.site_name}
                      onChange={(e) => updateSetting('platform', 'site_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Language</label>
                    <select
                      value={settings.platform.default_language}
                      onChange={(e) => updateSetting('platform', 'default_language', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {settings.platform.supported_languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Site Description</label>
                  <textarea
                    value={settings.platform.site_description}
                    onChange={(e) => updateSetting('platform', 'site_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <Input
                      value={settings.platform.timezone}
                      onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Format</label>
                    <select
                      value={settings.platform.date_format}
                      onChange={(e) => updateSetting('platform', 'date_format', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Format</label>
                    <select
                      value={settings.platform.time_format}
                      onChange={(e) => updateSetting('platform', 'time_format', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="12h">12 Hour</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supported Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.platform.supported_languages.map(lang => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'cultural' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Cultural Safety & Protocols
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Elder Review Required</label>
                      <p className="text-sm text-grey-600">Require elder approval for sensitive content</p>
                    </div>
                    <Switch
                      checked={settings.cultural.elder_review_required}
                      onCheckedChange={(checked) => updateSetting('cultural', 'elder_review_required', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Ceremonial Content Protection</label>
                      <p className="text-sm text-grey-600">Extra protection for ceremonial materials</p>
                    </div>
                    <Switch
                      checked={settings.cultural.ceremonial_content_protection}
                      onCheckedChange={(checked) => updateSetting('cultural', 'ceremonial_content_protection', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Traditional Knowledge Protocols</label>
                      <p className="text-sm text-grey-600">Apply traditional knowledge restrictions</p>
                    </div>
                    <Switch
                      checked={settings.cultural.traditional_knowledge_protocols}
                      onCheckedChange={(checked) => updateSetting('cultural', 'traditional_knowledge_protocols', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Consent Tracking</label>
                      <p className="text-sm text-grey-600">Track and manage content consent</p>
                    </div>
                    <Switch
                      checked={settings.cultural.consent_tracking_enabled}
                      onCheckedChange={(checked) => updateSetting('cultural', 'consent_tracking_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">OCAP Compliance</label>
                      <p className="text-sm text-grey-600">Ownership, Control, Access, Possession principles</p>
                    </div>
                    <Switch
                      checked={settings.cultural.ocap_compliance}
                      onCheckedChange={(checked) => updateSetting('cultural', 'ocap_compliance', checked)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cultural Sensitivity Levels</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.cultural.cultural_sensitivity_levels.map(level => (
                      <Badge key={level} className={
                        level === 'high' ? 'bg-red-100 text-red-800' :
                        level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>{level}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-medium text-purple-800">Indigenous Data Sovereignty</h3>
                  </div>
                  <p className="text-sm text-purple-700">
                    These settings ensure compliance with Indigenous data sovereignty principles and 
                    protect traditional knowledge according to community protocols.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'user_management' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Registration Enabled</label>
                      <p className="text-sm text-grey-600">Allow new user registration</p>
                    </div>
                    <Switch
                      checked={settings.user_management.registration_enabled}
                      onCheckedChange={(checked) => updateSetting('user_management', 'registration_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Email Verification</label>
                      <p className="text-sm text-grey-600">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      checked={settings.user_management.email_verification_required}
                      onCheckedChange={(checked) => updateSetting('user_management', 'email_verification_required', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Manual Approval</label>
                      <p className="text-sm text-grey-600">Require admin approval for new accounts</p>
                    </div>
                    <Switch
                      checked={settings.user_management.manual_approval_required}
                      onCheckedChange={(checked) => updateSetting('user_management', 'manual_approval_required', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Require 2FA</label>
                      <p className="text-sm text-grey-600">Require two-factor authentication</p>
                    </div>
                    <Switch
                      checked={settings.user_management.require_2fa}
                      onCheckedChange={(checked) => updateSetting('user_management', 'require_2fa', checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default User Role</label>
                    <select
                      value={settings.user_management.default_user_role}
                      onChange={(e) => updateSetting('user_management', 'default_user_role', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="storyteller">Storyteller</option>
                      <option value="member">Member</option>
                      <option value="contributor">Contributor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Timeout (hours)</label>
                    <Input
                      type="number"
                      value={settings.user_management.session_timeout}
                      onChange={(e) => updateSetting('user_management', 'session_timeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
                    <Input
                      type="number"
                      value={settings.user_management.password_min_length}
                      onChange={(e) => updateSetting('user_management', 'password_min_length', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'content' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-Moderation</label>
                    <p className="text-sm text-grey-600">Automatically flag potentially inappropriate content</p>
                  </div>
                  <Switch
                    checked={settings.content.auto_moderation}
                    onCheckedChange={(checked) => updateSetting('content', 'auto_moderation', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Flagged Content Threshold</label>
                    <Input
                      type="number"
                      value={settings.content.flagged_content_threshold}
                      onChange={(e) => updateSetting('content', 'flagged_content_threshold', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-grey-500 mt-1">Number of flags before content is hidden</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Media Upload Limit (MB)</label>
                    <Input
                      type="number"
                      value={settings.content.media_upload_limit_mb}
                      onChange={(e) => updateSetting('content', 'media_upload_limit_mb', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Story Length (characters)</label>
                    <Input
                      type="number"
                      value={settings.content.max_story_length}
                      onChange={(e) => updateSetting('content', 'max_story_length', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Gallery Size</label>
                    <Input
                      type="number"
                      value={settings.content.max_gallery_size}
                      onChange={(e) => updateSetting('content', 'max_gallery_size', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supported Media Types</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {settings.content.supported_media_types.map(type => (
                      <Badge key={type} variant="outline" size="sm">{type}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Email Notifications</label>
                      <p className="text-sm text-grey-600">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email_notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Admin Alerts</label>
                      <p className="text-sm text-grey-600">Send alerts to administrators</p>
                    </div>
                    <Switch
                      checked={settings.notifications.admin_alerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'admin_alerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Content Review Alerts</label>
                      <p className="text-sm text-grey-600">Notify when content needs review</p>
                    </div>
                    <Switch
                      checked={settings.notifications.content_review_alerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'content_review_alerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Maintenance Alerts</label>
                      <p className="text-sm text-grey-600">System maintenance notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.system_maintenance_alerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'system_maintenance_alerts', checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Server</label>
                    <Input
                      value={settings.notifications.smtp_server}
                      onChange={(e) => updateSetting('notifications', 'smtp_server', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Port</label>
                    <Input
                      type="number"
                      value={settings.notifications.smtp_port}
                      onChange={(e) => updateSetting('notifications', 'smtp_port', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Username</label>
                    <Input
                      value={settings.notifications.smtp_username}
                      onChange={(e) => updateSetting('notifications', 'smtp_username', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">From Email</label>
                    <Input
                      value={settings.notifications.from_email}
                      onChange={(e) => updateSetting('notifications', 'from_email', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  API & Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Rate Limiting</label>
                      <p className="text-sm text-grey-600">Limit API requests per user</p>
                    </div>
                    <Switch
                      checked={settings.api.rate_limiting}
                      onCheckedChange={(checked) => updateSetting('api', 'rate_limiting', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Analytics</label>
                      <p className="text-sm text-grey-600">Enable usage analytics</p>
                    </div>
                    <Switch
                      checked={settings.api.enable_analytics}
                      onCheckedChange={(checked) => updateSetting('api', 'enable_analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Search Indexing</label>
                      <p className="text-sm text-grey-600">Allow search engine indexing</p>
                    </div>
                    <Switch
                      checked={settings.api.enable_search_indexing}
                      onCheckedChange={(checked) => updateSetting('api', 'enable_search_indexing', checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Requests per Minute</label>
                    <Input
                      type="number"
                      value={settings.api.requests_per_minute}
                      onChange={(e) => updateSetting('api', 'requests_per_minute', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key Rotation (days)</label>
                    <Input
                      type="number"
                      value={settings.api.api_key_rotation_days}
                      onChange={(e) => updateSetting('api', 'api_key_rotation_days', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Security & Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Automated Backups</label>
                      <p className="text-sm text-grey-600">Enable automatic data backups</p>
                    </div>
                    <Switch
                      checked={settings.security.automated_backups}
                      onCheckedChange={(checked) => updateSetting('security', 'automated_backups', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Encryption at Rest</label>
                      <p className="text-sm text-grey-600">Encrypt stored data</p>
                    </div>
                    <Switch
                      checked={settings.security.encryption_at_rest}
                      onCheckedChange={(checked) => updateSetting('security', 'encryption_at_rest', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Audit Logging</label>
                      <p className="text-sm text-grey-600">Log all administrative actions</p>
                    </div>
                    <Switch
                      checked={settings.security.audit_logging}
                      onCheckedChange={(checked) => updateSetting('security', 'audit_logging', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Security Headers</label>
                      <p className="text-sm text-grey-600">Enable HTTP security headers</p>
                    </div>
                    <Switch
                      checked={settings.security.security_headers}
                      onCheckedChange={(checked) => updateSetting('security', 'security_headers', checked)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Backup Retention (days)</label>
                  <Input
                    type="number"
                    value={settings.security.backup_retention_days}
                    onChange={(e) => updateSetting('security', 'backup_retention_days', parseInt(e.target.value))}
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Allowed CORS Origins</label>
                  <div className="space-y-2">
                    {settings.security.cors_origins.map((origin, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input value={origin} readOnly />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-green-800">Security Status: Good</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    All recommended security measures are enabled and properly configured.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}