'use client'

import React, { useState, useEffect } from 'react'

const StorytellerManagement: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simple test to see if the component loads
    setTimeout(() => {
      console.log('StorytellerManagement component loaded')
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading storytellers test...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Storyteller Management</h2>
      <p>Component loaded successfully! The issue was with the complex API calls.</p>
    </div>
  )
}

export default StorytellerManagement