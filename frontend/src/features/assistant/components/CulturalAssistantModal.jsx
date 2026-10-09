import { useState } from 'react'
import { Sparkles, Mic, MicOff, Volume2, VolumeX, Send, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { useVoiceAssistant } from '../hooks/useVoiceAssistant'

export function CulturalAssistantModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    isSupported: isVoiceSupported,
    isListening,
    isSpeaking,
    error: voiceError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  } = useVoiceAssistant({
    onTranscript: (spokenText) => {
      setQuery(spokenText)
      handleSend(spokenText)
    },
  })

  if (!isOpen) return null

  const handleSend = async (queryText = query) => {
    const textToSend = typeof queryText === 'string' ? queryText.trim() : query.trim()
    if (!textToSend) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to query cultural knowledge base.')
      }

      setResponse(data.data)
      // Auto speak response if voice was used
      if (isListening) {
        speakText(data.data.answer)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border border-[var(--ink)] bg-[var(--paper)] max-w-xl w-full p-6 shadow-[var(--shadow-hard)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[var(--clay)] text-[var(--paper)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
                AI Cultural Field Assistant
              </h2>
              <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase">
                Grounded Knowledge · Academic Provenance
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSpeaking()
              onClose()
            }}
            className="font-mono text-xs border border-[var(--line)] px-2 py-0.5 hover:border-[var(--ink)]"
          >
            ✕
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-1.5">
          <span className="font-mono text-[10px] text-[var(--ink-2)] uppercase self-center mr-1">
            Explore:
          </span>
          {['Kyoto Machiya', 'Flamenco Duende', 'Diwali Lights', 'Eid al-Fitr'].map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => {
                setQuery(pill)
                handleSend(pill)
              }}
              className="border border-[var(--line)] bg-[var(--paper-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--ink-2)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-all"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Dialogue / Response Area */}
        <div className="min-h-[160px] max-h-[280px] overflow-y-auto border border-[var(--line)] bg-[var(--paper-2)] p-4 rounded space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8 space-y-2">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--clay)]" />
              <span className="font-mono text-xs text-[var(--ink-2)] ml-2">
                Retrieving verified cultural sources...
              </span>
            </div>
          )}

          {error && (
            <div className="border border-red-800/40 bg-red-950/10 p-3 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !response && !error && (
            <p className="text-xs text-[var(--ink-2)] italic text-center py-8">
              Ask any question regarding living traditions, sacred celebrations, folk craft genealogies, or historical diaspora routes.
            </p>
          )}

          {!isLoading && response && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs leading-relaxed text-[var(--ink)]">
                  {response.answer}
                </p>
                <button
                  type="button"
                  onClick={() => (isSpeaking ? stopSpeaking() : speakText(response.answer))}
                  title={isSpeaking ? 'Stop playback' : 'Read aloud'}
                  className="p-1 rounded border border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] shrink-0"
                >
                  {isSpeaking ? (
                    <VolumeX className="h-3.5 w-3.5 text-[var(--clay)]" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {response.sources?.length > 0 && (
                <div className="border-t border-[var(--line)] pt-2 space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[var(--clay)] flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Cited Scholarly References:
                  </span>
                  {response.sources.map((src, i) => (
                    <p key={i} className="font-mono text-[10px] text-[var(--ink-2)] pl-2 border-l border-[var(--clay)]">
                      "{src.title}" — {src.author || 'Archive'} ({src.publisher || 'Hailey Protocol'})
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Error notice */}
        {voiceError && (
          <p className="text-[10px] font-mono text-amber-700">{voiceError}</p>
        )}

        {/* Query Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Inquire about cultural roots, festivals, or traditions..."
            className="flex-1 border border-[var(--ink)] bg-[var(--paper-2)] px-3 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
          />

          {isVoiceSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded border border-[var(--ink)] transition-all ${
                isListening
                  ? 'bg-[var(--clay)] text-[var(--paper)] animate-pulse'
                  : 'bg-[var(--paper-2)] text-[var(--ink)] hover:bg-[var(--paper)]'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak inquiry'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] px-3.5 py-2 font-mono text-xs uppercase font-bold shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--clay)] transition-colors disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default CulturalAssistantModal
