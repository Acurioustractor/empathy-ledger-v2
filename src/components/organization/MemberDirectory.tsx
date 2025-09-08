'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Mail, 
  ExternalLink,
  UserCheck,
  Users
} from 'lucide-react'

interface Profile {
  id: string
  display_name: string | null
  full_name: string | null
  email: string | null
  current_role: string | null
  cultural_background: string | null
  location: string | null
  tenant_roles: string[] | null
  skills: string[] | null
  interests: string[] | null
  mentoring_availability: boolean | null
  created_at: string
}

interface MemberDirectoryProps {
  members: Profile[]
  organizationId: string
}

export function MemberDirectory({ members, organizationId }: MemberDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')

  const filteredMembers = members.filter(member => {
    const name = member.display_name || member.full_name || ''
    const role = member.current_role || ''
    const background = member.cultural_background || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      background.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === 'all' || 
      role.toLowerCase().includes(selectedRole.toLowerCase()) ||
      (member.tenant_roles || []).includes(selectedRole)

    return matchesSearch && matchesRole
  })

  const roles = [
    'all',
    ...new Set(members.flatMap(m => [
      m.current_role,
      ...(m.tenant_roles || [])
    ]).filter(Boolean))
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Members</h2>
          <p className="text-muted-foreground">
            {members.length} members in your organization
          </p>
        </div>
        
        <Badge variant="secondary" className="gap-2">
          <Users className="h-4 w-4" />
          {members.length} Total
        </Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members by name, role, or background..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {roles.map(role => (
            <option key={role} value={role}>
              {role === 'all' ? 'All Roles' : role}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/avatars/${member.id}.jpg`} />
                  <AvatarFallback>
                    {(member.display_name || member.full_name || 'M')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {member.display_name || member.full_name || 'Member'}
                  </CardTitle>
                  
                  {member.current_role && (
                    <p className="text-sm text-muted-foreground truncate">
                      {member.current_role}
                    </p>
                  )}
                </div>
                
                {member.mentoring_availability && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <UserCheck className="h-3 w-3" />
                    Mentor
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {member.cultural_background && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{member.cultural_background}</span>
                </div>
              )}
              
              {member.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{member.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {member.skills && member.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/storytellers/${member.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
                
                {member.email && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`mailto:${member.email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No members found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  )
}