'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Globe, 
  Search, 
  MapPin, 
  Calendar,
  ExternalLink,
  Plus,
  Filter,
  ArrowRight,
  BookOpen
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  description: string | null
  type: string
  location: string | null
  website_url: string | null
  member_count?: number
  story_count?: number
  created_at: string
  status?: string
}

export default function OrganizationsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    filterOrganizations()
  }, [searchTerm, selectedType, organizations])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/orgs')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
        setFilteredOrgs(data.organizations || [])
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrganizations = () => {
    let filtered = organizations

    if (searchTerm) {
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(org => org.type === selectedType)
    }

    setFilteredOrgs(filtered)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nonprofit': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-green-100 text-green-800'
      case 'educational': return 'bg-purple-100 text-purple-800'
      case 'cultural_center': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-earth-800 mb-4">
            Partner Organizations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover organizations preserving and sharing cultural stories across communities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">All Types</option>
              <option value="nonprofit">Non-Profit</option>
              <option value="community">Community</option>
              <option value="educational">Educational</option>
              <option value="cultural_center">Cultural Center</option>
            </select>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Join as Organization
            </Button>
          </div>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organizations...</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Organizations Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredOrgs.map((org) => (
              <Card 
                key={org.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/organizations/${org.id}/dashboard`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getTypeColor(org.type)}>
                      {formatType(org.type)}
                    </Badge>
                    {org.status === 'verified' && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-earth-600" />
                    {org.name}
                  </CardTitle>
                  
                  {org.location && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {org.location}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {org.description || 'Working to preserve and share cultural stories with the community.'}
                  </CardDescription>
                  
                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{org.member_count || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{org.story_count || 0} stories</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/organizations/${org.id}/dashboard`)
                      }}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    
                    {org.website_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(org.website_url, '_blank')
                        }}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-earth-800">
            Is Your Organization Missing?
          </h2>
          <p className="text-gray-600 mb-6">
            Join our network of organizations dedicated to preserving cultural stories and heritage
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Register Your Organization
            </Button>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}