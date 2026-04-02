import { NextRequest, NextResponse } from 'next/server'

// Ollama API endpoint - can be configured via environment variable
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, messages } = body

    if (!model || !messages) {
      return NextResponse.json(
        { error: 'Model and messages are required' },
        { status: 400 }
      )
    }

    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    })

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text()
      console.error('Ollama API error:', errorText)
      return NextResponse.json(
        { error: `Ollama API error: ${errorText}` },
        { status: ollamaResponse.status }
      )
    }

    const data = await ollamaResponse.json()
    
    return NextResponse.json(data.message.content)
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get available models
export async function GET() {
  try {
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!ollamaResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get models from Ollama' },
        { status: ollamaResponse.status }
      )
    }

    const data = await ollamaResponse.json()
    return NextResponse.json(data.models || [])
  } catch (error) {
    console.error('Get models error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to Ollama' },
      { status: 500 }
    )
  }
}