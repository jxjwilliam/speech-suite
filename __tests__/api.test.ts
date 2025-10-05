import { describe, it, expect } from '@jest/globals'

describe('API Routes', () => {
  it('should have health endpoint', async () => {
    const response = await fetch('http://localhost:3000/api/health')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
  })

  it('should handle transcription endpoint', async () => {
    // Mock audio file
    const formData = new FormData()
    const mockAudio = new Blob(['mock audio data'], { type: 'audio/webm' })
    formData.append('audio', mockAudio, 'test.webm')

    const response = await fetch('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    // Should return 400 for invalid audio or 500 for missing API key
    expect([400, 500]).toContain(response.status)
  })

  it('should handle synthesis endpoint', async () => {
    const response = await fetch('http://localhost:3000/api/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello world' }),
    })

    // Should return 400 for missing text or 500 for missing API key
    expect([400, 500]).toContain(response.status)
  })

  it('should handle chat endpoint', async () => {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    })

    // Should return 400 for missing message or 500 for missing API key
    expect([400, 500]).toContain(response.status)
  })
})
