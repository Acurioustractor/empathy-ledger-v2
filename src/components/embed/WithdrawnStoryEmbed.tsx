'use client'

import { ShieldOff } from 'lucide-react'

interface WithdrawnStoryEmbedProps {
  reason?: string
}

/**
 * Displayed when a story has been withdrawn or consent revoked.
 * Shows a respectful message explaining the story is no longer available.
 */
export function WithdrawnStoryEmbed({ reason }: WithdrawnStoryEmbedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-stone-50 p-8 text-center font-sans">
      <ShieldOff className="w-12 h-12 text-stone-400 mb-4" />
      <h3 className="font-semibold text-stone-700 text-lg">Story Withdrawn</h3>
      <p className="text-sm text-stone-500 mt-2 max-w-xs">
        {reason || 'The storyteller has withdrawn permission to display this story.'}
      </p>
      <a
        href="https://empathyledger.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-amber-700 hover:text-amber-800 mt-4 underline underline-offset-2"
      >
        Learn about Empathy Ledger
      </a>
    </div>
  )
}

export default WithdrawnStoryEmbed
