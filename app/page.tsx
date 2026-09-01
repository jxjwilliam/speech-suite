'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, Volume2, Download, Upload } from 'lucide-react'
import { SpeechToText } from '@/components/speech-to-text'
import { TextToSpeech } from '@/components/text-to-speech'
import { SettingsPanel } from '@/components/settings-panel'
import { AudioVisualizer } from '@/components/audio-visualizer'
import { ThemeToggle } from '@/components/theme-toggle'
import toast from 'react-hot-toast'

const SETTINGS_STORAGE_KEY = 'speech-suite-settings-v1'

const DEFAULT_SETTINGS = {
  sttProvider: 'browser',
  ttsProvider: 'browser',
  language: 'en-US',
  voice: 'default',
  rate: 1.0,
  pitch: 1.0,
}

const PREVIEW_TEXT = 'Hello! This is a preview of your selected voice.'

function sanitizeSettings(raw: any) {
  const s = { ...DEFAULT_SETTINGS, ...(raw || {}) }
  if (s.sttProvider !== 'browser' && s.sttProvider !== 'openai') s.sttProvider = 'browser'
  if (s.ttsProvider !== 'browser' && s.ttsProvider !== 'openai') s.ttsProvider = 'browser'
  if (s.ttsProvider === 'browser' && s.voice !== 'default') s.voice = 'default'
  if (s.ttsProvider === 'openai' && s.voice === 'default') s.voice = 'alloy'
  if (typeof s.rate !== 'number' || s.rate < 0.5 || s.rate > 2) s.rate = 1
  if (typeof s.pitch !== 'number' || s.pitch < 0.5 || s.pitch > 2) s.pitch = 1
  return s
}

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return sanitizeSettings(JSON.parse(raw))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [settings, setSettings] = useState(loadSettings)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  // Persist settings in the browser so refresh / reopen keeps them.
  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // localStorage unavailable (private mode etc.) — keep in-memory only
    }
  }, [settings])

  // Audio level visualization
  useEffect(() => {
    let animationFrame: number
    const updateAudioLevel = () => {
      if (isRecording) {
        // Simulate audio level for demo
        setAudioLevel(Math.random() * 100)
        animationFrame = requestAnimationFrame(updateAudioLevel)
      } else {
        setAudioLevel(0)
      }
    }

    if (isRecording) {
      updateAudioLevel()
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isRecording])

  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript)
    toast.success('Speech transcribed successfully!')
  }

  const handleSynthesisComplete = () => {
    setIsPlaying(false)
    toast.success('Speech synthesis completed!')
  }

  const handleExportTranscript = () => {
    if (!transcript) {
      toast.error('No transcript to export')
      return
    }

    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Transcript exported!')
  }

  const handlePreviewVoice = () => {
    if (settings.ttsProvider === 'browser') {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        toast.error('此浏览器不支持语音合成')
        return
      }
      const utterance = new SpeechSynthesisUtterance(PREVIEW_TEXT)
      utterance.lang = settings.language
      utterance.rate = settings.rate
      utterance.pitch = settings.pitch
      const voices = window.speechSynthesis.getVoices()
      const matched = voices.find(
        (v) => v.name === settings.voice || v.lang === settings.language
      )
      if (matched) utterance.voice = matched
      utterance.onstart = () => setIsPreviewing(true)
      utterance.onend = () => setIsPreviewing(false)
      utterance.onerror = (event) => {
        setIsPreviewing(false)
        if (
          event.error === 'interrupted' ||
          event.error === 'canceled'
        ) {
          return
        }
        toast.error('语音试听失败')
      }
      window.speechSynthesis.cancel()
      // Chrome can drop a speak() issued in the same tick as cancel().
      // Let cancel() settle, then resume() to un-stick the engine.
      window.setTimeout(() => {
        window.speechSynthesis.resume()
        window.speechSynthesis.speak(utterance)
      }, 50)
      return
    }

    // OpenAI mode — reuse the existing /api/synthesize route (unchanged).
    setIsPreviewing(true)
    fetch('/api/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: PREVIEW_TEXT, voice: settings.voice, model: 'tts-1' }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        if (previewAudioRef.current) {
          previewAudioRef.current.src = url
          previewAudioRef.current.onended = () => {
            setIsPreviewing(false)
            URL.revokeObjectURL(url)
          }
          previewAudioRef.current.play().catch(() => {
            setIsPreviewing(false)
            URL.revokeObjectURL(url)
          })
        }
      })
      .catch(() => {
        setIsPreviewing(false)
        toast.error('试听失败 — 请检查 OPENAI_API_KEY 是否有效')
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100 transition-colors duration-300 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Speech <span className="text-gradient">Suite</span>
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">STT · TTS · Voice Studio</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Hero */}
        <section className="mt-8 text-center sm:mt-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            🎙️ 默认浏览器语音 · 免费，无需 API Key
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Speak. Type. <span className="text-gradient">Listen.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            实时语音转文字、文件转录（OpenAI Whisper）、文字转语音 —— 全部可选，默认不产生任何费用。
          </p>
        </section>

        {/* Main Content */}
        <div className="mx-auto mt-8 max-w-6xl">
          <Tabs defaultValue="stt" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stt">🎙️ Speech-to-Text</TabsTrigger>
              <TabsTrigger value="tts">🔊 Text-to-Speech</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            </TabsList>

            {/* Speech-to-Text Tab */}
            <TabsContent value="stt" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recording Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Speech Recognition
                    </CardTitle>
                    <CardDescription>
                      实时识别使用浏览器（免费）· 文件转录使用 OpenAI Whisper（需 API Key）
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SpeechToText
                      onTranscript={handleTranscriptUpdate}
                      settings={settings}
                      isRecording={isRecording}
                      setIsRecording={setIsRecording}
                    />

                    {/* Audio Visualizer */}
                    <div className="flex items-center justify-center py-4">
                      <AudioVisualizer
                        level={audioLevel}
                        isActive={isRecording}
                        className="h-16"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Transcript Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>📝 Transcript</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportTranscript}
                          disabled={!transcript}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Your speech will appear here in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[200px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      {transcript ? (
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {transcript}
                        </p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          Start speaking to see your transcript here...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Text-to-Speech Tab */}
            <TabsContent value="tts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Text Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5" />
                      Text Input
                    </CardTitle>
                    <CardDescription>
                      Enter text to convert to speech
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TextToSpeech
                      onSynthesisComplete={handleSynthesisComplete}
                      settings={settings}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                    />
                  </CardContent>
                </Card>

                {/* Voice Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>🔊 Voice Preview</CardTitle>
                    <CardDescription>用当前音色试听一段固定文案</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted/60 p-4">
                      <p className="text-sm text-muted-foreground">
                        Current Voice:{' '}
                        <span className="font-semibold text-foreground">{settings.voice}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Provider:{' '}
                        <span className="font-semibold text-foreground capitalize">
                          {settings.ttsProvider === 'browser' ? 'Browser（免费）' : 'OpenAI'}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Language: <span className="font-semibold text-foreground">{settings.language}</span>
                        {' · '}Rate: {settings.rate}x{' · '}Pitch: {settings.pitch}x
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handlePreviewVoice}
                      disabled={isPreviewing}
                      className="w-full"
                    >
                      {isPreviewing ? '⏳ 试听中…' : '▶ Preview Voice'}
                    </Button>

                    <audio ref={previewAudioRef} className="hidden" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-8 text-center text-xs text-muted-foreground">
          <p>默认浏览器语音（免费）· 可选 OpenAI Whisper / TTS（需要 API Key）</p>
          <p className="mt-1">设置自动保存在本地浏览器</p>
        </footer>
      </div>
    </div>
  )
}
