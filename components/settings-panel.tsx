'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { getLanguageName } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SettingsPanelProps {
  settings: {
    sttProvider: string
    ttsProvider: string
    language: string
    voice: string
    rate: number
    pitch: number
  }
  onSettingsChange: (settings: any) => void
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const sttProviders = [
    { value: 'browser', label: 'Browser (Web Speech API)', description: '免费 · 无需 API Key · Chrome/Edge/Safari', disabled: false },
    { value: 'openai', label: 'OpenAI Whisper', description: '高准确率 · 文件转录 · 需要 API Key', disabled: false },
    { value: 'google', label: 'Google Cloud', description: '未提供 API Key · 暂不可用', disabled: true },
    { value: 'azure', label: 'Azure Speech', description: '未提供 API Key · 暂不可用', disabled: true },
  ]

  const ttsProviders = [
    { value: 'browser', label: 'Browser (Web Speech API)', description: '免费 · 系统音色 · 无需 API Key', disabled: false },
    { value: 'openai', label: 'OpenAI TTS', description: '6 个音色 · 需要 API Key', disabled: false },
    { value: 'google', label: 'Google Cloud TTS', description: '未提供 API Key · 暂不可用', disabled: true },
    { value: 'azure', label: 'Azure Speech TTS', description: '未提供 API Key · 暂不可用', disabled: true },
  ]

  const languages = [
    'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'pt-PT',
    'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'ar-SA', 'hi-IN', 'th-TH', 'vi-VN',
    'nl-NL', 'sv-SE', 'no-NO', 'da-DK', 'fi-FI', 'pl-PL', 'tr-TR', 'cs-CZ', 'hu-HU',
    'ro-RO', 'bg-BG', 'hr-HR', 'sk-SK', 'sl-SI', 'et-EE', 'lv-LV', 'lt-LT', 'el-GR',
    'he-IL', 'uk-UA', 'be-BY', 'ka-GE', 'hy-AM', 'az-AZ', 'kk-KZ', 'ky-KG', 'uz-UZ',
    'mn-MN', 'ne-NP', 'si-LK', 'ta-IN', 'te-IN', 'kn-IN', 'ml-IN', 'gu-IN', 'pa-IN',
    'bn-IN', 'or-IN', 'as-IN', 'mr-IN', 'ur-PK', 'fa-IR', 'ps-AF', 'sd-PK', 'bo-CN',
    'my-MM', 'km-KH', 'lo-LA', 'am-ET', 'sw-KE', 'zu-ZA', 'af-ZA', 'sq-AL', 'eu-ES',
    'ca-ES', 'gl-ES', 'cy-GB', 'ga-IE', 'is-IS', 'mt-MT', 'mk-MK', 'sr-RS', 'bs-BA',
    'me-ME', 'sq-XK'
  ]

  const openaiVoices = [
    'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
  ]

  const googleVoices = [
    'en-US-Standard-A', 'en-US-Standard-B', 'en-US-Standard-C', 'en-US-Standard-D',
    'en-US-Standard-E', 'en-US-Standard-F', 'en-US-Standard-G', 'en-US-Standard-H',
    'en-US-Standard-I', 'en-US-Standard-J', 'en-US-Wavenet-A', 'en-US-Wavenet-B',
    'en-US-Wavenet-C', 'en-US-Wavenet-D', 'en-US-Wavenet-E', 'en-US-Wavenet-F',
    'en-US-Wavenet-G', 'en-US-Wavenet-H', 'en-US-Wavenet-I', 'en-US-Wavenet-J'
  ]

  const azureVoices = [
    'en-US-AriaNeural', 'en-US-DavisNeural', 'en-US-GuyNeural', 'en-US-JaneNeural',
    'en-US-JasonNeural', 'en-US-JennyNeural', 'en-US-NancyNeural', 'en-US-SaraNeural',
    'en-US-TonyNeural', 'en-US-AvaNeural', 'en-US-AndrewNeural', 'en-US-EmmaNeural',
    'en-US-BrianNeural', 'en-US-AvaNeural', 'en-US-ChristopherNeural', 'en-US-ElizabethNeural'
  ]

  const getVoicesFor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return openaiVoices
      case 'google':
        return googleVoices
      case 'azure':
        return azureVoices
      default:
        return ['default']
    }
  }

  const handleSave = () => {
    const toSave = { ...localSettings }
    const voicesFor = getVoicesFor(toSave.ttsProvider)
    if (!voicesFor.includes(toSave.voice)) toSave.voice = voicesFor[0]
    onSettingsChange(toSave)
    toast.success('设置已保存到本地浏览器 ✅')
  }

  const handleReset = () => {
    setLocalSettings(settings)
    toast.success('已恢复为上次保存的设置')
  }

  const handleTtsProviderChange = (value: string) => {
    const next = { ...localSettings, ttsProvider: value }
    const voicesFor = getVoicesFor(value)
    if (!voicesFor.includes(next.voice)) next.voice = voicesFor[0]
    setLocalSettings(next)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Application Settings
          </CardTitle>
          <CardDescription>
            Configure your speech-to-text and text-to-speech preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Speech-to-Text Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">🎙️ Speech-to-Text</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stt-provider">STT Provider</Label>
                <Select
                  value={localSettings.sttProvider}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, sttProvider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sttProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value} disabled={provider.disabled}>
                        <div>
                          <div className="font-medium">{provider.label}</div>
                          <div className="text-xs text-gray-500">{provider.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={localSettings.language}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {getLanguageName(lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Text-to-Speech Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">🔊 Text-to-Speech</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tts-provider">TTS Provider</Label>
                <Select
                  value={localSettings.ttsProvider}
                  onValueChange={handleTtsProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ttsProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value} disabled={provider.disabled}>
                        <div>
                          <div className="font-medium">{provider.label}</div>
                          <div className="text-xs text-gray-500">{provider.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice">Voice</Label>
                <Select
                  value={localSettings.voice}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, voice: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getVoicesFor(localSettings.ttsProvider).map((voice) => (
                      <SelectItem key={voice} value={voice}>
                        {voice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Speech Rate: {localSettings.rate}x</Label>
                <Slider
                  value={[localSettings.rate]}
                  onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, rate: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pitch">Speech Pitch: {localSettings.pitch}x</Label>
                <Slider
                  value={[localSettings.pitch]}
                  onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, pitch: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">⚡ Advanced Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-detect" disabled />
                <Label htmlFor="auto-detect">Auto-detect language</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="noise-reduction" disabled />
                <Label htmlFor="noise-reduction">Noise reduction</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="punctuation" disabled />
                <Label htmlFor="punctuation">Auto punctuation</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="profanity-filter" disabled />
                <Label htmlFor="profanity-filter">Profanity filter</Label>
              </div>
            </div>
          </div>

          {/* Honest notes */}
          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <p>💡 默认使用浏览器语音，免费且无需 API Key。</p>
            <p className="mt-1">
              OpenAI Whisper / TTS 仅在切换到 OpenAI 后生效（需要有效的 OPENAI_API_KEY）；
              Google / Azure 尚未接入，故置灰不可选。
            </p>
            <p className="mt-1">
              语言设置作用于浏览器实时识别；文件转录当前固定英文（Whisper）。
              设置会自动保存在本地浏览器，刷新不丢失。
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
