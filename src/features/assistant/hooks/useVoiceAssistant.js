import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Web Speech API hook for Speech-to-Text and Text-to-Speech.
 * Gracefully handles permissions, unsupported browsers, and audio errors.
 */
export function useVoiceAssistant({ onTranscript } = {}) {
  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript
        setTranscript(text)
        if (typeof onTranscript === 'function') {
          onTranscript(text)
        }
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied by browser.')
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please speak into your microphone.')
        } else {
          setError(`Audio transcription error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript])

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.')
      return
    }
    setError(null)
    setTranscript('')
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.warn('[useVoiceAssistant] Recognition start note:', err)
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel() // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return {
    isSupported,
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  }
}

export default useVoiceAssistant
