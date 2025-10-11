import { Inngest } from 'inngest'

// Create Inngest client for queuing and processing jobs
export const inngest = new Inngest({
  id: 'empathy-ledger',
  name: 'Empathy Ledger',
  eventKey: process.env.INNGEST_EVENT_KEY,
  ...(process.env.INNGEST_BASE_URL && {
    baseUrl: process.env.INNGEST_BASE_URL,
  }),
})
