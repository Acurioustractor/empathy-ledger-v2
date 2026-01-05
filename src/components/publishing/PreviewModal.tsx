'use client'

import React from 'react'
import { EditorPreview } from '../editor/EditorPreview'

interface PreviewModalProps {
  story: any
}

export function PreviewModal({ story }: PreviewModalProps) {
  return (
    <div className="bg-white rounded-lg overflow-y-auto max-h-[600px]">
      <EditorPreview story={story} />
    </div>
  )
}
