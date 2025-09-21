'use client'

import { useState, useEffect } from 'react'

export default function TestOrgsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('🟡 TEST: Starting organisations test...')
    
    const timer = setTimeout(() => {
      setLoading(false)
      console.log('🔴 TEST: Timeout reached - stopping loading')
    }, 2000)

    fetch('/api/admin/orgs')
      .then(response => {
        console.log('🟢 TEST: API response status:', response.status)
        if (response.ok) {
          return response.json()
        }
        throw new Error(`HTTP ${response.status}`)
      })
      .then(data => {
        console.log('🟢 TEST: API data:', data)
        setData(data)
        setLoading(false)
        clearTimeout(timer)
      })
      .catch(err => {
        console.log('🔴 TEST: API error:', err)
        setError(err.message)
        setLoading(false)
        clearTimeout(timer)
      })

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'centre' }}>
        <div style={{ 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #3498db', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 2s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h1>LOADING TEST PAGE...</h1>
        <p>Check console for debug info</p>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>ORGANIZATIONS TEST RESULTS</h1>
      
      {error && (
        <div style={{ colour: 'red', background: '#ffeaea', padding: '10px', marginBottom: '20px' }}>
          <strong>ERROR:</strong> {error}
        </div>
      )}
      
      {data && (
        <div style={{ colour: 'green', background: '#eaffea', padding: '10px', marginBottom: '20px' }}>
          <strong>SUCCESS:</strong> Found {data.organisations?.length || 0} organisations
        </div>
      )}
      
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify({ error, data }, null, 2)}
      </pre>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/organisations" style={{ padding: '10px 20px', background: '#007cba', colour: 'white', textDecoration: 'none' }}>
          Go to Real Organizations Page
        </a>
      </div>
    </div>
  )
}