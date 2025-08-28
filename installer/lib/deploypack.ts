import yaml from 'js-yaml'

export interface DeployPack {
  name: string
  version: string
  ui: {
    productName: string
    description: string
    icon?: string
  }
  defaults: {
    region: string
    budgetMonthlyGBP: number
    auth: string
    projectPrefix?: string
  }
  parameters: Parameter[]
  secrets: Secret[]
  services: Service[]
  policies: {
    costCapGBP: number
    egress: string
    dataResidency: string
  }
  postInstall: PostInstall[]
  healthChecks: HealthCheck[]
}

export interface Parameter {
  key: string
  label: string
  required: boolean
  type: 'text' | 'email' | 'number'
  placeholder?: string
}

export interface Secret {
  key: string
  label: string
  required: boolean
  description?: string
}

export interface Service {
  kind: 'web' | 'db' | 'functions'
  runtime?: string
  entry?: string
  hosting?: string
  build?: string
  output?: string
  type?: string
  tier?: string
  region?: string
}

export interface PostInstall {
  type: 'url'
  label: string
  path: string
}

export interface HealthCheck {
  url: string
  expect: number
}

export function parseDeployPack(yamlContent: string): DeployPack {
  try {
    const parsed = yaml.load(yamlContent) as DeployPack
    
    // Validate required fields
    if (!parsed.name || !parsed.version || !parsed.ui) {
      throw new Error('Invalid DeployPack: missing required fields')
    }
    
    return parsed
  } catch (error) {
    throw new Error(`Failed to parse DeployPack: ${error}`)
  }
}

export async function fetchDeployPack(repoUrl: string): Promise<DeployPack> {
  try {
    // Convert GitHub URL to raw content URL
    const rawUrl = repoUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/')
      + '/deploypack.yaml'
    
    const response = await fetch(rawUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch DeployPack: ${response.statusText}`)
    }
    
    const yamlContent = await response.text()
    return parseDeployPack(yamlContent)
  } catch (error) {
    throw new Error(`Failed to fetch DeployPack: ${error}`)
  }
}
