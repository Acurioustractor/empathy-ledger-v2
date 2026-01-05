import { SyndicationConsentList } from '@/components/syndication/SyndicationConsentList'
import { Share2 } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SyndicationPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-sage-100">
            <Share2 className="h-6 w-6 text-sage-700" />
          </div>
          <h1 className="text-3xl font-bold">Syndication & Sharing</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Manage where your stories appear across external platforms. You maintain
          full control and can revoke access at any time.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Consents
              </p>
              <p className="text-2xl font-bold mt-1">
                {/* This will be populated dynamically */}
                —
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-sage-700" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Stories currently shared
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                External Views
              </p>
              <p className="text-2xl font-bold mt-1">
                {/* This will be populated dynamically */}
                —
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-sky-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Views from partner sites
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Partner Sites
              </p>
              <p className="text-2xl font-bold mt-1">
                {/* This will be populated dynamically */}
                —
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-clay-100 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-clay-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Platforms displaying your stories
          </p>
        </div>
      </div>

      {/* Cultural affirmation */}
      <div className="rounded-lg bg-sky-50 p-4 border border-sky-200 mb-8">
        <p className="text-sm text-sky-900 font-medium">
          ✨ Your Story, Your Control
        </p>
        <p className="text-sm text-sky-700 mt-1">
          You decide where your stories appear. Revoke access at any time—no
          questions asked. Your narrative sovereignty is sacred.
        </p>
      </div>

      {/* Consent list */}
      <SyndicationConsentList storytellerId={id} />
    </div>
  )
}
