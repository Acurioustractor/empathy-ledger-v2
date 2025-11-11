import { serve } from 'inngest/next'

import { inngest } from '@/lib/inngest/client'

import { processTranscriptFunction } from '@/lib/inngest/functions/process-transcript'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


// Create the Inngest API route handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processTranscriptFunction,
    // Add more functions here as needed
  ],
})
