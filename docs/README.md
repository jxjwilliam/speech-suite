# STT/TTS Hybrid App

A comprehensive cross-platform Speech-to-Text (STT) and Text-to-Speech (TTS) application built with Next.js, featuring multi-provider support and AI-powered accuracy.

## Features

### 🎤 Speech-to-Text (STT)
- **Multi-provider support**: OpenAI Whisper, Google Cloud Speech, Azure Speech, Browser Web Speech API
- **Real-time transcription**: Live speech recognition with visual feedback
- **File upload support**: Process pre-recorded audio files
- **Multi-language support**: 100+ languages with automatic detection
- **High accuracy**: AI-powered transcription with context awareness

### 🔊 Text-to-Speech (TTS)
- **Multiple providers**: OpenAI TTS, Google Cloud TTS, Azure Speech TTS, Browser Web Speech API
- **Voice customization**: 380+ voices across 75+ languages
- **Audio controls**: Play, pause, stop, and download functionality
- **Rate and pitch control**: Customize speech speed and tone
- **Real-time synthesis**: Instant audio generation

### 🤖 AI-Powered Features
- **Conversational AI**: Integrated chat functionality with GPT models
- **Context awareness**: Maintains conversation history
- **Smart responses**: Natural language processing and generation
- **Multi-modal interaction**: Seamless voice-to-voice conversations

### 🎨 Modern UI/UX
- **Responsive design**: Works on desktop, tablet, and mobile
- **Dark/light mode**: Automatic theme switching
- **Accessibility**: ARIA-compliant components
- **Real-time feedback**: Visual indicators and progress tracking
- **Settings panel**: Comprehensive configuration options

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Framer Motion**: Smooth animations

### Backend
- **Next.js API Routes**: Serverless functions
- **OpenAI API**: GPT models and Whisper
- **Google Cloud Speech**: Enterprise-grade STT/TTS
- **Azure Speech Services**: Microsoft's speech platform
- **Web Speech API**: Browser-native capabilities

### Audio Processing
- **Web Audio API**: Real-time audio analysis
- **MediaRecorder API**: Audio capture and recording
- **Audio Context**: Low-level audio manipulation
- **File handling**: Multiple audio format support

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (required)
- Google Cloud credentials (optional)
- Azure Speech key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd speech-suite
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_CREDENTIALS=path_to_credentials.json
   AZURE_SPEECH_KEY=your_azure_key
   AZURE_SPEECH_REGION=your_azure_region
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Speech-to-Text
1. **Real-time recording**: Click the microphone button to start/stop recording
2. **File upload**: Drag and drop audio files or use the upload button
3. **Language selection**: Choose your preferred language in settings
4. **Provider selection**: Switch between different STT providers

### Text-to-Speech
1. **Text input**: Type or paste text in the input area
2. **Voice selection**: Choose from available voices
3. **Audio controls**: Play, pause, or download the generated audio
4. **Customization**: Adjust rate, pitch, and other parameters

### AI Conversation
1. **Start recording**: Use the microphone to speak your message
2. **AI processing**: The system transcribes, processes, and responds
3. **Voice output**: Listen to the AI's spoken response
4. **History**: View and manage conversation history

## Configuration

### STT Providers
- **OpenAI Whisper**: Highest accuracy, 99+ languages
- **Google Cloud**: Fast processing, 125+ languages  
- **Azure Speech**: Enterprise features, 100+ languages
- **Browser API**: Free, limited languages

### TTS Providers
- **OpenAI TTS**: High quality, 11 voices
- **Google Cloud TTS**: 380+ voices, 75+ languages
- **Azure Speech TTS**: Neural voices, 100+ languages
- **Browser API**: System voices, free

### Settings
- **Language**: Auto-detection or manual selection
- **Voice**: Gender, accent, and style preferences
- **Audio quality**: Sample rate and bit depth
- **Performance**: Latency vs. quality trade-offs

## API Endpoints

### `/api/transcribe`
- **Method**: POST
- **Input**: Audio file (FormData)
- **Output**: Transcription text and metadata
- **Providers**: OpenAI, Google, Azure, Browser

### `/api/synthesize`
- **Method**: POST
- **Input**: Text, voice, and settings (JSON)
- **Output**: Audio file (MP3)
- **Providers**: OpenAI, Google, Azure, Browser

### `/api/chat`
- **Method**: POST
- **Input**: Message and conversation history
- **Output**: AI response text
- **Models**: GPT-4, GPT-3.5, Claude, Gemini

## Deployment

### Vercel (Recommended)
1. **Connect repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

### Manual deployment
```bash
npm run build
npm start
```

## Performance Optimization

### Latency Reduction
- **Streaming APIs**: Real-time processing
- **Model selection**: Balance speed vs. accuracy
- **Caching**: Store frequently used responses
- **CDN**: Global content delivery

### Accuracy Improvement
- **Context prompting**: Provide relevant context
- **Post-processing**: LLM-based correction
- **Language detection**: Automatic language identification
- **Noise reduction**: Audio preprocessing

## Troubleshooting

### Common Issues
1. **Microphone permissions**: Ensure browser allows microphone access
2. **API rate limits**: Check provider quotas and usage
3. **Audio format**: Supported formats vary by provider
4. **Network issues**: Check internet connection and API endpoints

### Browser Compatibility
- **Chrome/Edge**: Full feature support
- **Firefox**: Most features supported
- **Safari**: Limited Web Speech API support
- **Mobile**: iOS/Android compatibility varies

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@example.com

## Acknowledgments

- **OpenAI**: For Whisper and GPT models
- **Google Cloud**: For Speech-to-Text and Text-to-Speech APIs
- **Microsoft Azure**: For Cognitive Services
- **shadcn/ui**: For the component library
- **Next.js team**: For the amazing framework

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.