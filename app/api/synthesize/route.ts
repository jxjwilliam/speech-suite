import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'alloy', model = 'tts-1' } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    // Call OpenAI TTS API
    const response = await openai.audio.speech.create({
      model: model,
      voice: voice as any,
      input: text,
      response_format: 'mp3'
    })

    // Convert the response to a buffer
    const buffer = Buffer.from(await response.arrayBuffer())
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('TTS synthesis error:', error)
    return NextResponse.json(
      { error: `Failed to synthesize speech: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
