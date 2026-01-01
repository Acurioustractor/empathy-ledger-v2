// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'



export async function GET(request: NextRequest) {
  console.log('🧪 TEST AUTH ROUTE CALLED')

  return NextResponse.json({
    success: true,
    message: 'Test route working',
    url: request.url,
    timestamp: new Date().toISOString()
  })
}