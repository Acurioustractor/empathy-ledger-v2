'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, BookOpen, FolderOpen, ArrowRight } from 'lucide-react'

interface OrgSummary {
  id: string
  name: string
  memberCount: number
  storyCount: number
  projectCount: number
}

interface MultiOrgSummaryProps {
  organizations: OrgSummary[]
  currentOrgId: string
}

export function MultiOrgSummary({ organizations, currentOrgId }: MultiOrgSummaryProps) {
  // Don't render if user only has access to one org
  if (organizations.length <= 1) {
    return null
  }

  const otherOrgs = organizations.filter(org => org.id !== currentOrgId)
  const currentOrg = organizations.find(org => org.id === currentOrgId)

  return (
    <Card className="bg-gradient-to-r from-stone-50 to-earth-50 border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-earth-600" />
          Your Organizations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 px-3 font-medium text-stone-600">Organization</th>
                <th className="text-center py-2 px-3 font-medium text-stone-600">
                  <Users className="w-4 h-4 inline-block" />
                </th>
                <th className="text-center py-2 px-3 font-medium text-stone-600">
                  <BookOpen className="w-4 h-4 inline-block" />
                </th>
                <th className="text-center py-2 px-3 font-medium text-stone-600">
                  <FolderOpen className="w-4 h-4 inline-block" />
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {/* Current org first */}
              {currentOrg && (
                <tr className="bg-earth-50/50">
                  <td className="py-2 px-3">
                    <span className="font-medium text-earth-800">{currentOrg.name}</span>
                    <span className="ml-2 text-xs text-earth-600 bg-earth-100 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  </td>
                  <td className="text-center py-2 px-3 text-stone-700">{currentOrg.memberCount}</td>
                  <td className="text-center py-2 px-3 text-stone-700">{currentOrg.storyCount}</td>
                  <td className="text-center py-2 px-3 text-stone-700">{currentOrg.projectCount}</td>
                  <td></td>
                </tr>
              )}
              {/* Other orgs */}
              {otherOrgs.map(org => (
                <tr key={org.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-2 px-3">
                    <span className="text-stone-700">{org.name}</span>
                  </td>
                  <td className="text-center py-2 px-3 text-stone-600">{org.memberCount}</td>
                  <td className="text-center py-2 px-3 text-stone-600">{org.storyCount}</td>
                  <td className="text-center py-2 px-3 text-stone-600">{org.projectCount}</td>
                  <td className="py-2 px-3">
                    <a
                      href={`/organisations/${org.id}/dashboard`}
                      className="text-earth-600 hover:text-earth-700"
                      title={`Switch to ${org.name}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-500">
          You have access to {organizations.length} organizations
        </div>
      </CardContent>
    </Card>
  )
}
