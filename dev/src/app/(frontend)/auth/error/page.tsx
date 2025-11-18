import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; returnUrl?: string }>
}) {
  const params = await searchParams
  const errorType = params.error || 'unknown'
  const errorMessage = params.message || 'An error occurred during authentication.'
  const returnUrl = params.returnUrl || '/api/admin/auth/signin'

  // Map error types to user-friendly messages
  const getErrorDetails = (type: string) => {
    switch (type) {
      case 'signup_disabled':
        return {
          title: 'Sign-up Not Allowed',
          description: 'New user registrations are currently disabled. Please contact an administrator for access.',
        }
      case 'missing_code':
        return {
          title: 'Authentication Failed',
          description: 'The authentication process was incomplete. Please try signing in again.',
        }
      case 'token_exchange_failed':
        return {
          title: 'Authentication Failed',
          description: 'Unable to verify your credentials. Please try signing in again.',
        }
      case 'callback_error':
        return {
          title: 'Authentication Error',
          description: 'An error occurred while processing your login. Please try again.',
        }
      default:
        return {
          title: 'Authentication Error',
          description: errorMessage,
        }
    }
  }

  const { title, description } = getErrorDetails(errorType)

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">{description}</p>

        {errorType !== 'unknown' && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              Error code: <code className="font-mono">{errorType}</code>
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href={returnUrl}>Try Again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
