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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] max-w-xl w-full p-6 md:p-8 space-y-5 text-[#34252A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-4">
          <div className="flex items-center gap-3">
            <span className="neu-circle h-9 w-9 rounded-full bg-[#6A1F35] text-[#FAF6EF] flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#34252A]">
                AI Cultural Field Assistant
              </h2>
              <span className="font-mono text-[10px] text-[#B08A50] uppercase tracking-wider font-semibold">
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
            className="neu-circle h-8 w-8 rounded-full border border-[#E0D4C5] bg-[#F0E7DA] hover:bg-[#FAF6EF] text-[#34252A] flex items-center justify-center cursor-pointer transition-all"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] text-[#34252A]/60 uppercase self-center mr-1 font-semibold">
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
              className="neu-pill rounded-full border border-[#E0D4C5] bg-[#F0E7DA] px-3 py-1 font-mono text-[11px] text-[#34252A] hover:border-[#6A1F35]/40 hover:text-[#6A1F35] cursor-pointer transition-all"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Dialogue / Response Area */}
        <div className="min-h-[160px] max-h-[290px] overflow-y-auto neu-inset rounded-2xl bg-[#F0E7DA]/50 border border-[#E0D4C5] p-5 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8 space-y-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#6A1F35]" />
              <span className="font-mono text-xs text-[#B08A50] font-semibold ml-2">
                Retrieving verified cultural sources...
              </span>
            </div>
          )}

          {error && (
            <div className="border border-red-200 bg-red-50 p-3.5 rounded-xl text-xs text-[#6A1F35] flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !response && !error && (
            <p className="text-xs text-[#34252A]/60 italic text-center py-8 leading-relaxed">
              Ask any question regarding living traditions, sacred celebrations, folk craft genealogies, or historical diaspora routes.
            </p>
          )}

          {!isLoading && response && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs leading-relaxed text-[#34252A]">
                  {response.answer}
                </p>
                <button
                  type="button"
                  onClick={() => (isSpeaking ? stopSpeaking() : speakText(response.answer))}
                  title={isSpeaking ? 'Stop playback' : 'Read aloud'}
                  className="neu-circle h-7 w-7 rounded-full border border-[#E0D4C5] bg-[#FAF6EF] flex items-center justify-center text-[#6A1F35] hover:bg-[#F0E7DA] shrink-0 cursor-pointer transition-all"
                >
                  {isSpeaking ? (
                    <VolumeX className="h-3.5 w-3.5 text-[#6A1F35]" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {response.sources?.length > 0 && (
                <div className="border-t border-[#E0D4C5] pt-3 space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#B08A50] flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Cited Scholarly References:
                  </span>
                  {response.sources.map((src, i) => (
                    <p key={i} className="font-mono text-[10px] text-[#34252A]/80 pl-2.5 border-l-2 border-[#B08A50]">
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
          <p className="text-[10px] font-mono text-amber-800">{voiceError}</p>
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
            className="flex-1 neu-inset-input rounded-full bg-[#F0E7DA] border border-[#E0D4C5] px-4 py-2.5 text-xs text-[#34252A] placeholder:text-[#34252A]/50 focus:outline-none focus:border-[#6A1F35] transition-all"
          />

          {isVoiceSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isListening
                  ? 'bg-[#6A1F35] text-[#FAF6EF] border-[#511528] animate-pulse shadow-[0_2px_8px_rgba(106,31,53,0.3)]'
                  : 'neu-circle bg-[#F0E7DA] text-[#6A1F35] border-[#E0D4C5] hover:bg-[#FAF6EF]'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak inquiry'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="neu-burgundy-pill rounded-full px-4 py-2.5 font-mono text-xs uppercase font-bold text-[#FAF6EF] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default CulturalAssistantModal
