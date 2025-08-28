'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader2, Rocket, Settings, Database, Globe } from 'lucide-react'
import { DeployPack, fetchDeployPack } from '../lib/deploypack'
import { GoogleCloudManager } from '../lib/google-cloud'

interface DeploymentStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'error'
  message?: string
}

export default function InstallerPage() {
  const [deployPack, setDeployPack] = useState<DeployPack | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'welcome' | 'auth' | 'config' | 'deploy' | 'complete'>('welcome')
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [googleManager] = useState(() => new GoogleCloudManager())

  useEffect(() => {
    loadDeployPack()
  }, [])

  const loadDeployPack = async () => {
    try {
      setLoading(true)
      const pack = await fetchDeployPack('https://github.com/leighrobertabbott/IMPACT-Course-Admin')
      setDeployPack(pack)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deployment configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInstall = async () => {
    try {
      setStep('auth')
      await googleManager.initialize()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authentication')
    }
  }

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('deploy')
    await startDeployment()
  }

  const startDeployment = async () => {
    if (!deployPack) return

    const steps: DeploymentStep[] = [
      { id: 'project', title: 'Creating Google Cloud project', status: 'pending' },
      { id: 'apis', title: 'Enabling required APIs', status: 'pending' },
      { id: 'firebase', title: 'Setting up Firebase', status: 'pending' },
      { id: 'firestore', title: 'Creating Firestore database', status: 'pending' },
      { id: 'webapp', title: 'Creating Firebase web app', status: 'pending' },
      { id: 'deploy', title: 'Deploying application', status: 'pending' },
    ]

    setDeploymentSteps(steps)

    try {
      // Generate project ID
      const hospitalName = formData.hospitalName || 'impact'
      const baseId = hospitalName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const projectId = `${baseId}-${Date.now().toString().slice(-6)}`

      // Step 1: Create project
      await updateStep('project', 'running')
      await googleManager.createProject(projectId, `${formData.hospitalName} IMPACT System`)
      await updateStep('project', 'completed')

      // Step 2: Enable APIs
      await updateStep('apis', 'running')
      const apis = [
        'firebase.googleapis.com',
        'firestore.googleapis.com',
        'firebasehosting.googleapis.com',
        'identitytoolkit.googleapis.com',
        'cloudfunctions.googleapis.com',
        'cloudbuild.googleapis.com',
        'run.googleapis.com',
      ]
      await googleManager.enableAPIs(projectId, apis)
      await updateStep('apis', 'completed')

      // Step 3: Add Firebase
      await updateStep('firebase', 'running')
      await googleManager.addFirebaseToProject(projectId)
      await updateStep('firebase', 'completed')

      // Step 4: Create Firestore
      await updateStep('firestore', 'running')
      await googleManager.createFirestoreDatabase(projectId, deployPack.defaults.region)
      await updateStep('firestore', 'completed')

      // Step 5: Create web app
      await updateStep('webapp', 'running')
      const webApp = await googleManager.createFirebaseWebApp(projectId, `${formData.hospitalName} IMPACT`)
      await updateStep('webapp', 'completed')

      // Step 6: Deploy
      await updateStep('deploy', 'running')
      await googleManager.triggerCloudBuild(projectId, 'https://github.com/leighrobertabbott/IMPACT-Course-Admin')
      await updateStep('deploy', 'completed')

      setStep('complete')
    } catch (err) {
      const currentStep = deploymentSteps.find(s => s.status === 'running')
      if (currentStep) {
        await updateStep(currentStep.id, 'error', err instanceof Error ? err.message : 'Unknown error')
      }
    }
  }

  const updateStep = async (id: string, status: DeploymentStep['status'], message?: string) => {
    setDeploymentSteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, status, message } : step
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading deployment configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Installation Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!deployPack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <p className="text-gray-600">No deployment configuration found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Rocket className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            One-Tap Deploy
          </h1>
          <p className="text-gray-600">
            Install {deployPack.ui.productName} in minutes
          </p>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {step === 'welcome' && (
            <div className="card">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{deployPack.ui.icon}</div>
                <h2 className="text-2xl font-semibold mb-2">{deployPack.ui.productName}</h2>
                <p className="text-gray-600 mb-6">{deployPack.ui.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-primary-600" />
                  <span>Automatic Google Cloud setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-primary-600" />
                  <span>Firebase Hosting & Firestore database</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-primary-600" />
                  <span>Live application in minutes</span>
                </div>
              </div>

              <button 
                onClick={handleStartInstall}
                className="btn-primary w-full"
              >
                Start Installation
              </button>
            </div>
          )}

          {step === 'auth' && (
            <div className="card text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
              <h2 className="text-xl font-semibold mb-2">Authenticating with Google</h2>
              <p className="text-gray-600">
                Redirecting to Google to authorize deployment...
              </p>
            </div>
          )}

          {step === 'config' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                {deployPack.parameters.map(param => (
                  <div key={param.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.label}
                      {param.required && <span className="text-error-500">*</span>}
                    </label>
                    <input
                      type={param.type}
                      placeholder={param.placeholder}
                      required={param.required}
                      value={formData[param.key] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [param.key]: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                ))}
                <button type="submit" className="btn-primary w-full">
                  Deploy Application
                </button>
              </form>
            </div>
          )}

          {step === 'deploy' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Deploying Application</h2>
              <div className="space-y-3">
                {deploymentSteps.map(step => (
                  <div key={step.id} className="flex items-center space-x-3">
                    {step.status === 'pending' && (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    {step.status === 'running' && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                    )}
                    {step.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-success-500" />
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-error-500" />
                    )}
                    <span className={step.status === 'error' ? 'text-error-600' : ''}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="card text-center">
              <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Installation Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your {deployPack.ui.productName} is now live and ready to use.
              </p>
              <div className="space-y-3">
                {deployPack.postInstall.map((item, index) => (
                  <a
                    key={index}
                    href={`https://${formData.hospitalName?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-6)}.web.app${item.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary block"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
