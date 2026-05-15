'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, MicOff, Volume2, VolumeX, Settings, Download, Upload } from 'lucide-react'
import { SpeechToText } from '@/components/speech-to-text'
import { TextToSpeech } from '@/components/text-to-speech'
import { SettingsPanel } from '@/components/settings-panel'
import { AudioVisualizer } from '@/components/audio-visualizer'
import toast from 'react-hot-toast'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [synthesisText, setSynthesisText] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [settings, setSettings] = useState({
    sttProvider: 'openai',
    ttsProvider: 'openai',
    language: 'en-US',
    voice: 'alloy',
    rate: 1.0,
    pitch: 1.0,
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            STT/TTS Hybrid App
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Multi-provider Speech-to-Text and Text-to-Speech with AI-powered accuracy
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="stt" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stt" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Speech-to-Text
              </TabsTrigger>
              <TabsTrigger value="tts" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Text-to-Speech
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
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
                      Convert your speech to text using advanced AI models
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
                      <span>Transcript</span>
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
                    <CardTitle>Voice Preview</CardTitle>
                    <CardDescription>
                      Test your voice settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Current Voice: <span className="font-medium">{settings.voice}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Language: <span className="font-medium">{settings.language}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rate: <span className="font-medium">{settings.rate}x</span> | 
                          Pitch: <span className="font-medium">{settings.pitch}x</span>
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSynthesisText("Hello! This is a preview of your selected voice.")
                        }}
                        className="w-full"
                      >
                        Preview Voice
                      </Button>
                    </div>
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
        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p>
            Powered by OpenAI, Google Cloud, and Azure Speech Services
          </p>
        </footer>
      </div>
    </div>
  )
}
