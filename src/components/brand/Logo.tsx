'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show wordmark text */
  showWordmark?: boolean
  /** Show tagline */
  showTagline?: boolean
  /** Custom className */
  className?: string
  /** Dark mode variant (light logo on dark background) */
  variant?: 'default' | 'light' | 'mono'
}

const sizes = {
  xs: { mark: 24, text: 'text-sm', tagline: 'text-[10px]' },
  sm: { mark: 32, text: 'text-base', tagline: 'text-xs' },
  md: { mark: 40, text: 'text-lg', tagline: 'text-xs' },
  lg: { mark: 48, text: 'text-xl', tagline: 'text-sm' },
  xl: { mark: 64, text: 'text-2xl', tagline: 'text-base' },
}

export function Logo({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className,
  variant = 'default',
}: LogoProps) {
  const { mark, text, tagline } = sizes[size]

  // Color schemes based on variant
  const colors = {
    default: {
      gradient: ['#96643a', '#b84a32', '#5c6d51'],
      text: 'text-earth-900',
      taglineColor: 'text-sage-600',
    },
    light: {
      gradient: ['#f3ebe0', '#fae8e4', '#d4dace'],
      text: 'text-cream-100',
      taglineColor: 'text-cream-300',
    },
    mono: {
      gradient: ['#42291a', '#42291a', '#42291a'],
      text: 'text-earth-900',
      taglineColor: 'text-stone-500',
    },
  }

  const scheme = colors[variant]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Mark - Embrace */}
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`logoGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={scheme.gradient[0]} />
            <stop offset="50%" stopColor={scheme.gradient[1]} />
            <stop offset="100%" stopColor={scheme.gradient[2]} />
          </linearGradient>
        </defs>
        {/* Embrace - Two open circles holding each other */}
        <path
          d="M17 13 A11 11 0 1 0 17 35"
          stroke={`url(#logoGrad-${variant})`}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M31 35 A11 11 0 1 0 31 13"
          stroke={`url(#logoGrad-${variant})`}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-serif font-semibold tracking-tight leading-tight',
              text,
              scheme.text
            )}
          >
            Empathy Ledger
          </span>
          {showTagline && (
            <span className={cn('font-sans leading-tight', tagline, scheme.taglineColor)}>
              Every Story Matters
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** Standalone mark for favicons, mobile headers, etc */
export function LogoMark({
  size = 40,
  variant = 'default',
  className,
}: {
  size?: number
  variant?: 'default' | 'light' | 'mono'
  className?: string
}) {
  const colors = {
    default: {
      gradient: ['#96643a', '#b84a32', '#5c6d51'],
    },
    light: {
      gradient: ['#f3ebe0', '#fae8e4', '#d4dace'],
    },
    mono: {
      gradient: ['#42291a', '#42291a', '#42291a'],
    },
  }

  const scheme = colors[variant]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Empathy Ledger"
    >
      <defs>
        <linearGradient id={`markGrad-${variant}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={scheme.gradient[0]} />
          <stop offset="50%" stopColor={scheme.gradient[1]} />
          <stop offset="100%" stopColor={scheme.gradient[2]} />
        </linearGradient>
      </defs>
      {/* Embrace - Two open circles holding each other */}
      <path
        d="M17 13 A11 11 0 1 0 17 35"
        stroke={`url(#markGrad-${variant}-${size})`}
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M31 35 A11 11 0 1 0 31 13"
        stroke={`url(#markGrad-${variant}-${size})`}
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default Logo
