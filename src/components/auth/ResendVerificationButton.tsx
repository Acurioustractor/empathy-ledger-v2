'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resendVerificationEmail } from '@/app/actions/auth-actions'

interface ResendVerificationButtonProps {
  email: string
}

export function ResendVerificationButton({ email }: ResendVerificationButtonProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(false)

  const handleResend = async () => {
    if (cooldown) return

    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      const result = await resendVerificationEmail(email)

      if (result.success) {
        setResendSuccess(true)
        setCooldown(true)

        // Reset success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000)

        // Cooldown for 60 seconds to prevent spam
        setTimeout(() => setCooldown(false), 60000)
      } else {
        setResendError(result.error || 'Failed to resend verification email')
      }
    } catch (error: any) {
      setResendError(error.message || 'An unexpected error occurred')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-4">
      {resendSuccess && (
        <Alert variant="default" className="bg-sage-50 dark:bg-sage-950/20 border-sage-200 dark:border-sage-800">
          <CheckCircle2 className="h-4 w-4 text-sage-600 dark:text-sage-400" />
          <AlertDescription className="text-sage-700 dark:text-sage-300">
            Verification email sent! Please check your inbox.
          </AlertDescription>
        </Alert>
      )}

      {resendError && (
        <Alert variant="destructive">
          <AlertDescription>{resendError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleResend}
        disabled={isResending || cooldown}
        variant="outline"
        size="cultural"
        className="w-full"
      >
        {isResending ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : cooldown ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Email Sent
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resend Verification Email
          </>
        )}
      </Button>
    </div>
  )
}
