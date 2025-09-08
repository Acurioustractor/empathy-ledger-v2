'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestMinimalPage() {
  const [result, setResult] = useState('Ready to test')
  
  const testMinimal = async () => {
    try {
      setResult('Creating client...')
      
      // Create a fresh client directly here
      const supabase = createClient(
        'https://yvnuayzslukamizrlhwb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDQ4NTAsImV4cCI6MjA3MTgyMDg1MH0.UV8JOXSwANMl72lRjw-9d4CKniHSlDk9hHZpKHYN6Bs'
      )
      
      setResult('Making auth request...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@empathyledger.com',
        password: 'admin123',
      })
      
      if (error) {
        setResult(`Auth error: ${error.message}`)
      } else {
        setResult(`Success! User: ${data.user?.email}`)
        // Clean up
        await supabase.auth.signOut()
      }
      
    } catch (error) {
      setResult(`Exception: ${error}`)
      console.error(error)
    }
  }
  
  return (
    <div className="p-8">
      <h1>Minimal Auth Test</h1>
      <button 
        onClick={testMinimal}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Test Minimal Auth
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre>{result}</pre>
      </div>
    </div>
  )
}