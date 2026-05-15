import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if required environment variables are present
    const requiredEnvVars = ['OPENAI_API_KEY']
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: `Missing required environment variables: ${missingVars.join(', ')}`,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    // Check API connectivity (optional)
    const healthChecks = {
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      azure: !!process.env.AZURE_SPEECH_KEY,
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: healthChecks,
      uptime: process.uptime()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
