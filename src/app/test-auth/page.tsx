'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [result, setResult] = useState('')
  
  const testEnvVars = () => {
    console.log('Environment check:')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND')
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'FOUND' : 'NOT FOUND')
    setResult(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING'}, KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING'}`)
  }
  
  const testAuth = async () => {
    try {
      console.log('Testing auth...')
      console.log('Supabase client:', supabase)
      setResult('Testing...')
      
      console.log('Making auth request...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@empathyledger.com',
        password: 'admin123',
      })
      
      console.log('Auth request completed:', { data, error })
      
      if (error) {
        setResult(`Error: ${error.message}`)
        console.error(error)
      } else {
        setResult(`Success: ${data.user?.email}`)
        console.log('Success:', data)
        
        // Sign out immediately for testing
        await supabase.auth.signOut()
      }
    } catch (err) {
      setResult(`Exception: ${err}`)
      console.error(err)
    }
  }
  
  return (
    <div className="p-8">
      <h1>Auth Test Page</h1>
      <button 
        onClick={testEnvVars}
        className="bg-green-500 text-white px-4 py-2 rounded mr-4"
      >
        Check Environment
      </button>
      <button 
        onClick={testAuth}
        className="bg-sage-500 text-white px-4 py-2 rounded"
      >
        Test Auth
      </button>
      <p className="mt-4">{result}</p>
    </div>
  )
}