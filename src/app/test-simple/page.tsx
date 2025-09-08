'use client'

import { useState, useEffect } from 'react'

export default function TestSimplePage() {
  const [result, setResult] = useState('')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const testSimpleAuth = async () => {
    try {
      setResult('Testing with fetch...')
      
      // Test direct fetch to Supabase auth endpoint
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('Direct fetch test...')
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          email: 'admin@empathyledger.com',
          password: 'admin123'
        })
      })
      
      console.log('Response status:', response.status)
      const text = await response.text()
      console.log('Response text:', text)
      
      setResult(`Status: ${response.status}, Response: ${text.substring(0, 100)}...`)
      
    } catch (error) {
      console.error('Direct fetch error:', error)
      setResult(`Fetch error: ${error}`)
    }
  }
  
  if (!mounted) return <div>Loading...</div>
  
  return (
    <div className="p-8">
      <h1>Simple Auth Test</h1>
      <button 
        onClick={testSimpleAuth}
        className="bg-purple-500 text-white px-4 py-2 rounded"
      >
        Test Direct Fetch
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre>{result}</pre>
      </div>
    </div>
  )
}