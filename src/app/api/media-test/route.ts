import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('📋 Test media GET route called')
  return NextResponse.json({ message: 'Test route working' })
}

export async function POST(request: Request) {
  console.log('📤 Test media POST route called')
  return NextResponse.json({ message: 'Test POST working' })
}