/**
 * ARIA (Accessible Rich Internet Applications) Helpers
 * Utilities for making components accessible
 */

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * ARIA live region announcer
 */
export class LiveRegionAnnouncer {
  private politeRegion: HTMLElement
  private assertiveRegion: HTMLElement

  constructor() {
    // Create polite live region
    this.politeRegion = document.createElement('div')
    this.politeRegion.setAttribute('role', 'status')
    this.politeRegion.setAttribute('aria-live', 'polite')
    this.politeRegion.setAttribute('aria-atomic', 'true')
    this.politeRegion.className = 'sr-only'
    document.body.appendChild(this.politeRegion)

    // Create assertive live region
    this.assertiveRegion = document.createElement('div')
    this.assertiveRegion.setAttribute('role', 'alert')
    this.assertiveRegion.setAttribute('aria-live', 'assertive')
    this.assertiveRegion.setAttribute('aria-atomic', 'true')
    this.assertiveRegion.className = 'sr-only'
    document.body.appendChild(this.assertiveRegion)
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion

    // Clear previous message
    region.textContent = ''

    // Add new message (timeout ensures screen reader picks it up)
    setTimeout(() => {
      region.textContent = message
    }, 100)
  }

  destroy() {
    document.body.removeChild(this.politeRegion)
    document.body.removeChild(this.assertiveRegion)
  }
}

// Global announcer instance
let announcer: LiveRegionAnnouncer | null = null

export function getAnnouncer(): LiveRegionAnnouncer {
  if (!announcer) {
    announcer = new LiveRegionAnnouncer()
  }
  return announcer
}

/**
 * ARIA attributes builder
 */
export interface AriaProps {
  label?: string
  labelledBy?: string
  describedBy?: string
  required?: boolean
  invalid?: boolean
  disabled?: boolean
  expanded?: boolean
  selected?: boolean
  checked?: boolean
  pressed?: boolean
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  controls?: string
  owns?: string
  haspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  live?: 'off' | 'polite' | 'assertive'
  atomic?: boolean
  busy?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  hidden?: boolean
}

export function buildAriaProps(props: AriaProps): Record<string, any> {
  const ariaProps: Record<string, any> = {}

  if (props.label) ariaProps['aria-label'] = props.label
  if (props.labelledBy) ariaProps['aria-labelledby'] = props.labelledBy
  if (props.describedBy) ariaProps['aria-describedby'] = props.describedBy
  if (props.required !== undefined) ariaProps['aria-required'] = props.required
  if (props.invalid !== undefined) ariaProps['aria-invalid'] = props.invalid
  if (props.disabled !== undefined) ariaProps['aria-disabled'] = props.disabled
  if (props.expanded !== undefined) ariaProps['aria-expanded'] = props.expanded
  if (props.selected !== undefined) ariaProps['aria-selected'] = props.selected
  if (props.checked !== undefined) ariaProps['aria-checked'] = props.checked
  if (props.pressed !== undefined) ariaProps['aria-pressed'] = props.pressed
  if (props.current !== undefined) ariaProps['aria-current'] = props.current
  if (props.controls) ariaProps['aria-controls'] = props.controls
  if (props.owns) ariaProps['aria-owns'] = props.owns
  if (props.haspopup !== undefined) ariaProps['aria-haspopup'] = props.haspopup
  if (props.live) ariaProps['aria-live'] = props.live
  if (props.atomic !== undefined) ariaProps['aria-atomic'] = props.atomic
  if (props.busy !== undefined) ariaProps['aria-busy'] = props.busy
  if (props.relevant) ariaProps['aria-relevant'] = props.relevant
  if (props.hidden !== undefined) ariaProps['aria-hidden'] = props.hidden

  return ariaProps
}

/**
 * Screen reader only text
 */
export function srOnlyClass(): string {
  return 'sr-only'
}

/**
 * Visually hidden but accessible to screen readers
 */
export const visuallyHiddenStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: 0
}

/**
 * Form validation message helper
 */
export function getValidationMessage(field: string, error?: string): string {
  if (!error) return `${field} is valid`

  return `${field} error: ${error}`
}

/**
 * Progress announcement
 */
export function announceProgress(current: number, total: number, label: string = 'items') {
  const percentage = Math.round((current / total) * 100)
  const message = `${current} of ${total} ${label} loaded. ${percentage}% complete.`

  getAnnouncer().announce(message, 'polite')
}

/**
 * Success/Error announcements
 */
export function announceSuccess(message: string) {
  getAnnouncer().announce(`Success: ${message}`, 'polite')
}

export function announceError(message: string) {
  getAnnouncer().announce(`Error: ${message}`, 'assertive')
}

/**
 * Navigation announcement
 */
export function announceNavigation(pageName: string) {
  getAnnouncer().announce(`Navigated to ${pageName}`, 'polite')
}
