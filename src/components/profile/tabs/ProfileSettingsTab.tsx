'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProfileSettingsTabProps {
  userEmail: string | undefined
  onSignOut: () => void
}

export function ProfileSettingsTab({
  userEmail,
  onSignOut
}: ProfileSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences and security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Email Address</h4>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <Button variant="outline" size="sm">Change Email</Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Password</h4>
            <p className="text-sm text-muted-foreground">Last updated recently</p>
          </div>
          <Button variant="outline" size="sm">Change Password</Button>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={onSignOut} variant="destructive">
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
