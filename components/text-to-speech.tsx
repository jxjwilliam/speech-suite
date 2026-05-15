'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Play, Pause, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TextToSpeechProps {
  onSynthesisComplete: () => void
  settings: {
    ttsProvider: string
    language: string
    voice: string
    rate: number
    pitch: number
  }
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
}

export function TextToSpeech({ 
  onSynthesisComplete, 
  settings, 
  isPlaying, 
  setIsPlaying 
}: TextToSpeechProps) {
  const [text, setText] = useState('')
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Set up speech synthesis
      const utterance = new SpeechSynthesisUtterance()
      utterance.lang = settings.language
      utterance.rate = settings.rate
      utterance.pitch = settings.pitch
      
      // Try to set voice
      const voices = speechSynthesis.getVoices()
      const selectedVoice = voices.find(voice => 
        voice.name === settings.voice || 
        voice.lang === settings.language
      )
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        onSynthesisComplete()
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        toast.error(`Speech synthesis error: ${event.error}`)
        setIsPlaying(false)
        setIsPaused(false)
      }

      synthesisRef.current = utterance
    }
  }, [settings, onSynthesisComplete])

  const speak = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to speak')
      return
    }

    if (settings.ttsProvider === 'browser' && synthesisRef.current) {
      // Use browser's built-in speech synthesis
      synthesisRef.current.text = text
      speechSynthesis.speak(synthesisRef.current)
      setIsPlaying(true)
      setIsPaused(false)
      toast.success('Started speaking...')
    } else {
      // Use API-based synthesis
      await synthesizeWithAPI()
    }
  }

  const synthesizeWithAPI = async () => {
    setIsSynthesizing(true)
    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          provider: settings.ttsProvider,
          language: settings.language,
          voice: settings.voice,
          rate: settings.rate,
          pitch: settings.pitch,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to synthesize speech')
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
        setIsPaused(false)
        toast.success('Started speaking...')
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error)
      toast.error('Failed to synthesize speech')
    } finally {
      setIsSynthesizing(false)
    }
  }

  const pause = () => {
    if (settings.ttsProvider === 'browser' && synthesisRef.current) {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause()
        setIsPaused(true)
      } else if (speechSynthesis.paused) {
        speechSynthesis.resume()
        setIsPaused(false)
      }
    } else if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play()
        setIsPaused(false)
      } else {
        audioRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const stop = () => {
    if (settings.ttsProvider === 'browser' && synthesisRef.current) {
      speechSynthesis.cancel()
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setIsPaused(false)
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = `speech-${Date.now()}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Audio downloaded!')
    } else {
      toast.error('No audio to download')
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setIsPaused(false)
    onSynthesisComplete()
  }

  const isWebSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div className="space-y-2">
        <label htmlFor="tts-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter text to speak:
        </label>
        <textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <div className="text-xs text-gray-500">
          {text.length} characters
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={speak}
          disabled={!text.trim() || isSynthesizing}
          className="flex items-center space-x-2"
        >
          {isSynthesizing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Speak</span>
            </>
          )}
        </Button>

        {isPlaying && (
          <>
            <Button
              onClick={pause}
              variant="outline"
              size="sm"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={stop}
              variant="outline"
              size="sm"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          </>
        )}

        {audioUrl && (
          <Button
            onClick={downloadAudio}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onPause={() => setIsPaused(true)}
        onPlay={() => setIsPaused(false)}
        className="hidden"
      />

      {/* Voice Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Voice Settings:
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Provider:</span>
            <span className="ml-2 font-medium capitalize">{settings.ttsProvider}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Voice:</span>
            <span className="ml-2 font-medium">{settings.voice}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Rate:</span>
            <span className="ml-2 font-medium">{settings.rate}x</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Pitch:</span>
            <span className="ml-2 font-medium">{settings.pitch}x</span>
          </div>
        </div>
      </div>

      {/* Browser Support Notice */}
      {!isWebSpeechSupported && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Browser speech synthesis not supported. Using API-based synthesis.
          </p>
        </div>
      )}
    </div>
  )
}
