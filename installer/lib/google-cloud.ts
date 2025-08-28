import { google } from 'googleapis'

// Google Cloud API scopes needed for deployment
const SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/firebase',
  'https://www.googleapis.com/auth/cloud-platform.projects',
  'https://www.googleapis.com/auth/cloud-platform.billing',
]

export interface GoogleCloudClient {
  auth: any
  cloudresourcemanager: any
  firebase: any
  cloudbuild: any
  firestore: any
}

export class GoogleCloudManager {
  private client: GoogleCloudClient | null = null

  async initialize(): Promise<void> {
    try {
      // Initialize Google Auth with PKCE flow
      const auth = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        undefined,
        window.location.origin + '/auth/callback'
      )

      // Check if user is already authenticated
      const token = await this.getStoredToken()
      if (token) {
        auth.setCredentials(token)
        this.client = this.createClient(auth)
        return
      }

      // Start OAuth flow
      const authUrl = auth.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
      })

      // Store the auth URL and redirect
      localStorage.setItem('authUrl', authUrl)
      window.location.href = authUrl
    } catch (error) {
      console.error('Failed to initialize Google Cloud:', error)
      throw error
    }
  }

  async handleCallback(code: string): Promise<void> {
    try {
      const auth = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        undefined,
        window.location.origin + '/auth/callback'
      )

      const { tokens } = await auth.getToken(code)
      auth.setCredentials(tokens)
      
      // Store tokens
      localStorage.setItem('googleTokens', JSON.stringify(tokens))
      
      this.client = this.createClient(auth)
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error)
      throw error
    }
  }

  private createClient(auth: any): GoogleCloudClient {
    return {
      auth,
      cloudresourcemanager: google.cloudresourcemanager({ version: 'v1', auth }),
      firebase: google.firebase({ version: 'v1beta1', auth }),
      cloudbuild: google.cloudbuild({ version: 'v1', auth }),
      firestore: google.firestore({ version: 'v1', auth }),
    }
  }

  private async getStoredToken(): Promise<any> {
    const stored = localStorage.getItem('googleTokens')
    if (stored) {
      const tokens = JSON.parse(stored)
      // Check if token is expired
      if (tokens.expiry_date && Date.now() < tokens.expiry_date) {
        return tokens
      }
    }
    return null
  }

  async createProject(projectId: string, projectName: string): Promise<any> {
    if (!this.client) throw new Error('Not authenticated')

    try {
      const response = await this.client.cloudresourcemanager.projects.create({
        requestBody: {
          projectId,
          name: projectName,
        },
      })

      return response.data
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  async enableAPIs(projectId: string, apis: string[]): Promise<void> {
    if (!this.client) throw new Error('Not authenticated')

    try {
      const serviceusage = google.serviceusage({ version: 'v1', auth: this.client.auth })
      
      await serviceusage.services.batchEnable({
        parent: `projects/${projectId}`,
        requestBody: {
          serviceIds: apis,
        },
      })
    } catch (error) {
      console.error('Failed to enable APIs:', error)
      throw error
    }
  }

  async addFirebaseToProject(projectId: string): Promise<any> {
    if (!this.client) throw new Error('Not authenticated')

    try {
      const response = await this.client.firebase.projects.addFirebase({
        parent: `projects/${projectId}`,
      })

      return response.data
    } catch (error) {
      console.error('Failed to add Firebase to project:', error)
      throw error
    }
  }

  async createFirestoreDatabase(projectId: string, region: string): Promise<any> {
    if (!this.client) throw new Error('Not authenticated')

    try {
      const response = await this.client.firestore.projects.databases.create({
        parent: `projects/${projectId}`,
        requestBody: {
          locationId: region,
          type: 'FIRESTORE_NATIVE',
        },
      })

      return response.data
    } catch (error) {
      console.error('Failed to create Firestore database:', error)
      throw error
    }
  }

  async createFirebaseWebApp(projectId: string, appName: string): Promise<any> {
    if (!this.client) throw new Error('Not authenticated')

    try {
      const response = await this.client.firebase.projects.webApps.create({
        parent: `projects/${projectId}`,
        requestBody: {
          displayName: appName,
        },
      })

      return response.data
    } catch (error) {
      console.error('Failed to create Firebase web app:', error)
      throw error
    }
  }

  async getFirebaseConfig(appName: string): Promise<any> {
    if (!this.client) throw new Error('Not authenticated')

    try {
      const response = await this.client.firebase.projects.webApps.getConfig({
        name: appName,
      })

      return response.data
    } catch (error) {
      console.error('Failed to get Firebase config:', error)
      throw error
    }
  }

  async triggerCloudBuild(projectId: string, repoUrl: string): Promise<any> {
    if (!this.client) throw new Error('Not authenticated')

    try {
      const response = await this.client.cloudbuild.projects.builds.create({
        projectId,
        requestBody: {
          source: {
            repoSource: {
              repoName: 'github_leighrobertabbott_IMPACT-Course-Admin',
              branchName: 'main',
            },
          },
          steps: [
            {
              name: 'node:18',
              args: ['npm', 'install'],
            },
            {
              name: 'node:18',
              args: ['npm', 'run', 'build'],
            },
            {
              name: 'gcr.io/cloud-builders/firebase',
              args: ['deploy', '--only', 'hosting,functions', '--project', projectId],
            },
          ],
        },
      })

      return response.data
    } catch (error) {
      console.error('Failed to trigger Cloud Build:', error)
      throw error
    }
  }
}
