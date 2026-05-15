import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create a temporary file-like object for OpenAI API
    const file = new File([buffer], audioFile.name, { type: audioFile.type })
    
    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // You can make this configurable
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    })

    return NextResponse.json({ 
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      words: transcription.words
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
