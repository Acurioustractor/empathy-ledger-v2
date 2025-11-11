// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function GET() {
  return new Response('test works', { status: 200 })
}