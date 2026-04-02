'use client'

import { useState, useRef, useEffect } from 'react'

// Available Ollama models
const OLLAMA_MODELS = [
  { name: 'llama3', label: 'Llama 3' },
  { name: 'llama3.1', label: 'Llama 3.1' },
  { name: 'llama3.2', label: 'Llama 3.2' },
  { name: 'mistral', label: 'Mistral' },
  { name: 'mixtral', label: 'Mixtral' },
  { name: 'phi3', label: 'Phi-3' },
  { name: 'qwen', label: 'Qwen' },
  { name: 'codellama', label: 'CodeLlama' },
  { name: 'orca-mini', label: 'Orca Mini' },
  { name: 'neural-chat', label: 'Neural Chat' },
  { name: 'wizardlm2', label: 'WizardLM 2' },
  { name: 'aya', label: 'Aya' },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('llama3')
  const [isLoading, setIsLoading] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from Ollama')
      }

      const data = await response.json()
      
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? { ...m, content: data.message }
            : m
        )
      )
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? { ...m, content: 'Error: Unable to connect to Ollama. Make sure Ollama is running on your machine.' }
            : m
        )
      )
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const selectedModelLabel = OLLAMA_MODELS.find(m => m.name === selectedModel)?.label || selectedModel

  return (
    <main className="relative w-full h-screen flex flex-col overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/46011e44-1f9d-4c5e-b716-300b8ce1381e_3840w.jpg"
          alt="Luxury Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 gradient-overlay"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 glass">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl text-white font-serif tracking-tight">
            Ollamito
          </h1>
          <span className="text-xs text-white/50 uppercase tracking-widest hidden md:block">
            AI Chat
          </span>
        </div>
        
        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-white text-sm hover:bg-white/10 transition-all"
          >
            <span className="text-white/70">Model:</span>
            <span className="font-medium">{selectedModelLabel}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showModels ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showModels && (
            <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-lg glass model-selector shadow-xl">
              <div className="py-2">
                {OLLAMA_MODELS.map(model => (
                  <button
                    key={model.name}
                    onClick={() => {
                      setSelectedModel(model.name)
                      setShowModels(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/5 transition-colors ${
                      selectedModel === model.name
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-primary'
                    }`}
                  >
                    {model.label}
                    {selectedModel === model.name && (
                      <span className="ml-2 text-xs text-primary/50">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Chat Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-8 pb-32">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-8 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-white/90 text-lg md:text-xl font-light mb-4">
                Start a conversation with Ollama
              </p>
              <p className="text-white/60 text-sm">
                Select a model and send a message to begin
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`message-enter ${
                  message.role === 'user'
                    ? 'ml-auto max-w-[85%]'
                    : 'mr-auto max-w-[90%]'
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-white/90 text-primary'
                      : 'glass text-white'
                  }`}
                >
                  {message.role === 'assistant' && isLoading && !message.content ? (
                    <span className="loading-dots text-white/70">Generating response</span>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                      {message.role === 'assistant' && isLoading && messages[messages.length - 1]?.id === message.id && (
                        <span className="typewriter-cursor text-white/70 ml-1" />
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 px-4 md:px-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-3 glass rounded-2xl p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 chat-input rounded-xl px-4 py-3 text-sm resize-none min-h-[48px] max-h-32"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-button bg-white text-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-all disabled:hover:bg-white disabled:hover:text-primary"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
          
          <p className="text-center text-white/40 text-xs mt-3">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </main>
  )
}