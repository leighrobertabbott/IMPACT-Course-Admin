'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { GoogleCloudManager } from '../../lib/google-cloud'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setError(error)
        setStatus('error')
        return
      }

      if (!code) {
        setError('No authorization code received')
        setStatus('error')
        return
      }

      const googleManager = new GoogleCloudManager()
      await googleManager.handleCallback(code)
      
      setStatus('success')
      
      // Redirect back to main page after a short delay
      setTimeout(() => {
        window.location.href = '/?step=config'
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="card max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary-600" />
            <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
            <p className="text-gray-600">Please wait while we complete your Google sign-in...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Successful!</h2>
            <p className="text-gray-600">Redirecting to configuration...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
