import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Respond naturally and conversationally. Keep responses concise but informative.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ]

    // Call OpenAI Chat API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ 
      response,
      usage: completion.usage
    })
  } catch (error) {
    console.error('Chat completion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
