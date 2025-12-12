'use client'

import { Heart } from 'lucide-react'

interface EmpathyLedgerBadgeProps {
  variant?: 'default' | 'minimal' | 'dark'
}

/**
 * "Powered by Empathy Ledger" badge for embeds.
 * Links back to Empathy Ledger and signals trust/verification.
 */
export function EmpathyLedgerBadge({ variant = 'default' }: EmpathyLedgerBadgeProps) {
  const baseClasses = "inline-flex items-center gap-1.5 text-xs font-medium transition-colors"

  const variantClasses = {
    default: "text-stone-500 hover:text-stone-700",
    minimal: "text-stone-400 hover:text-stone-600",
    dark: "text-stone-300 hover:text-white"
  }

  return (
    <a
      href="https://empathyledger.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${variantClasses[variant]}`}
      title="Stories protected by Empathy Ledger"
    >
      <Heart className="w-3 h-3" />
      <span>Empathy Ledger</span>
    </a>
  )
}

export default EmpathyLedgerBadge
