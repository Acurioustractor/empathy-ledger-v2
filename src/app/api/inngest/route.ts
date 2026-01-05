// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { serve } from 'inngest/next'

import { inngest } from '@/lib/inngest/client'

import { processTranscriptFunction } from '@/lib/inngest/functions/process-transcript'
import {
  processContentRevocation,
  verifyContentRemoval,
  retryFailedWebhooks,
} from '@/lib/inngest/functions/syndication-webhook-jobs'

// Create the Inngest API route handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processTranscriptFunction,
    // Syndication webhook functions
    processContentRevocation,
    verifyContentRemoval,
    retryFailedWebhooks,
  ],
})
