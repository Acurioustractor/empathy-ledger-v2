/**
 * Focus Management Utilities
 * Keyboard navigation and focus trap for accessibility
 */

/**
 * Focus trap - keeps focus within a container
 * Useful for modals, dialogs, and dropdowns
 */
export function createFocusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  // Focus first element
  firstFocusable?.focus()

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Skip to main content
 */
export function skipToMain() {
  const mainContent = document.querySelector('main')
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1')
    mainContent.focus()
    mainContent.removeAttribute('tabindex')
  }
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * React hook for focus trap
 */
import { useEffect, useRef } from 'react'

export function useFocusTrap<T extends HTMLElement>(active: boolean = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active || !ref.current) return

    const cleanup = createFocusTrap(ref.current)
    return cleanup
  }, [active])

  return ref
}

/**
 * React hook for auto-focus
 */
export function useAutoFocus<T extends HTMLElement>(shouldFocus: boolean = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus()
    }
  }, [shouldFocus])

  return ref
}

/**
 * Keyboard shortcuts manager
 */
export class KeyboardShortcuts {
  private shortcuts: Map<string, () => void> = new Map()

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  register(keys: string, callback: () => void) {
    this.shortcuts.set(keys.toLowerCase(), callback)
  }

  unregister(keys: string) {
    this.shortcuts.delete(keys.toLowerCase())
  }

  private handleKeyDown(e: KeyboardEvent) {
    const key = [
      e.ctrlKey && 'ctrl',
      e.metaKey && 'meta',
      e.altKey && 'alt',
      e.shiftKey && 'shift',
      e.key.toLowerCase()
    ]
      .filter(Boolean)
      .join('+')

    const callback = this.shortcuts.get(key)
    if (callback) {
      e.preventDefault()
      callback()
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown)
    this.shortcuts.clear()
  }
}

/**
 * React hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  keys: string,
  callback: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    const shortcuts = new KeyboardShortcuts()
    shortcuts.register(keys, callback)

    return () => {
      shortcuts.destroy()
    }
  }, [keys, ...deps])
}
