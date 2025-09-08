'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  ExternalLink, 
  Calendar,
  ArrowRight
} from 'lucide-react'

interface Member {
  id: string
  display_name: string | null
  full_name: string | null
  current_role: string | null
  created_at: string
}

interface MemberHighlightsProps {
  members: Member[]
  organizationId: string
}

export function MemberHighlights({ members, organizationId }: MemberHighlightsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent Members
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href={`/organizations/${organizationId}/members`}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
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
                  
                  <div className="space-y-1">
                    <div className="font-medium">
                      {member.display_name || member.full_name || 'Member'}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </div>
                    {member.current_role && (
                      <Badge variant="outline" className="text-xs">
                        {member.current_role}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/storytellers/${member.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No members yet</p>
            <p className="text-sm">New members will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}