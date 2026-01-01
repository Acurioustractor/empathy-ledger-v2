'use client'

import React, { useState } from 'react'
import CommandPalette from '@/components/features/CommandPalette/CommandPalette'
import { Toaster } from 'sonner'

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false)

  // Add floating trigger button for demo
  React.useEffect(() => {
    // This will be handled by the CommandPalette component's keyboard listener
  }, [])

  return (
    <>
      {children}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'font-sans',
        }}
      />
      
      {/* Floating Cmd+K hint */}
      <div className="fixed bottom-20 right-8 z-40 hidden lg:flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm text-sm text-grey-600">
        <span>Quick search</span>
        <kbd className="px-2 py-1 text-xs bg-grey-100 border rounded">⌘K</kbd>
      </div>
    </>
  )
}