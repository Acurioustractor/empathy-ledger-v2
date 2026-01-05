/**
 * Toast Hook
 *
 * Simple toast notification hook for user feedback.
 * Can be enhanced with a toast library like sonner or react-hot-toast.
 */

import { useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastType
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([])

  const toast = ({ title, description, variant = 'info', duration = 3000 }: ToastOptions) => {
    // Simple console log for now
    // In production, this would trigger a UI toast notification
    console.log(`[${variant.toUpperCase()}] ${title}`, description || '')

    // Add to toast list
    const newToast = { title, description, variant, duration }
    setToasts(prev => [...prev, newToast])

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== newToast))
    }, duration)
  }

  return {
    toast,
    toasts
  }
}

// Export convenience methods
export const toast = {
  success: (title: string, description?: string) => {
    console.log(`[SUCCESS] ${title}`, description || '')
  },
  error: (title: string, description?: string) => {
    console.error(`[ERROR] ${title}`, description || '')
  },
  info: (title: string, description?: string) => {
    console.info(`[INFO] ${title}`, description || '')
  },
  warning: (title: string, description?: string) => {
    console.warn(`[WARNING] ${title}`, description || '')
  }
}
