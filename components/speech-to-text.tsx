'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SpeechToTextProps {
  onTranscript: (transcript: string) => void
  settings: {
    sttProvider: string
    language: string
  }
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export function SpeechToText({ 
  onTranscript, 
  settings, 
  isRecording, 
  setIsRecording 
}: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set client state to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Stabilize the onTranscript callback
  const handleTranscript = useCallback((transcript: string) => {
    onTranscript(transcript)
  }, [onTranscript])

  // Initialize Web Speech API
  useEffect(() => {
    if (isClient && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = settings.language

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const newTranscript = finalTranscript || interimTranscript
        setTranscript(newTranscript)
        if (finalTranscript) {
          handleTranscript(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        toast.error(`Speech recognition error: ${event.error}`)
        setIsListening(false)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }
    }
  }, [isClient, settings.language, handleTranscript])

  const startListening = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    // Check if already listening
    if (isListening || isRecording) {
      console.warn('Speech recognition already active')
      return
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop the stream immediately
      
      setIsListening(true)
      setIsRecording(true)
      recognitionRef.current.start()
      toast.success('Started listening...')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setIsRecording(false)
    toast.success('Stopped listening')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        toast.error('File size must be less than 25MB')
        return
      }
      
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      toast.success('Audio file uploaded')
    }
  }

  const processAudioFile = async () => {
    if (!audioFile) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('provider', settings.sttProvider)
      formData.append('language', settings.language)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process audio')
      }

      const data = await response.json()
      // Support both `{ text: string }` (OpenAI) and legacy `{ transcript: string }`
      const transcriptText = data.text ?? data.transcript ?? ''
      setTranscript(transcriptText)
      handleTranscript(transcriptText)
      toast.success('Audio processed successfully!')
    } catch (error) {
      console.error('Error processing audio:', error)
      toast.error('Failed to process audio file')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAudio = () => {
    setAudioFile(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isWebSpeechSupported = isClient && typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  return (
    <div className="space-y-4">
      {/* Real-time Speech Recognition */}
      {isWebSpeechSupported && (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={cn(
                "w-20 h-20 rounded-full",
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isListening ? 'Listening... Click to stop' : 'Click to start speaking'}
            </p>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="audio-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Upload audio file
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  MP3, WAV, M4A, or WebM (max 25MB)
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {audioFile && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {audioFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={processAudioFile}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? 'Processing...' : 'Process'}
                </Button>
                <Button
                  onClick={clearAudio}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Transcript */}
      {transcript && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Current Transcript:
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {transcript}
          </p>
        </div>
      )}
    </div>
  )
}
