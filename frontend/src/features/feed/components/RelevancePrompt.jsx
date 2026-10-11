import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, HelpCircle, Check } from 'lucide-react'
import { submitRelevanceAnswer } from '@/features/feed/services/feedService'

export function RelevancePrompt({ userId, postId, initialAnswer = null, onAnswerSubmitted }) {
  const [selectedAnswer, setSelectedAnswer] = useState(initialAnswer)
  const [isSubmitted, setIsSubmitted] = useState(initialAnswer !== null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswer = async (answer) => {
    if (isSubmitted || isSubmitting) return
    setSelectedAnswer(answer)
    setIsSubmitting(true)

    try {
      await submitRelevanceAnswer({ userId, postId, answer })
      setIsSubmitted(true)
      if (onAnswerSubmitted) onAnswerSubmitted(answer)
    } catch (err) {
      console.warn('[RelevancePrompt] Failed to record feedback:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="neu-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 font-mono text-[11px] text-emerald-800 font-medium">
        <Check className="h-3.5 w-3.5 text-emerald-700" />
        <span>Relevance feedback saved</span>
      </div>
    )
  }

  return (
    <div className="neu-card rounded-2xl bg-[#F0E7DA]/60 border border-[#E0D4C5] p-3 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs text-[#34252A]">
      <div className="flex items-center gap-1.5 text-[#34252A]/70">
        <HelpCircle className="h-3.5 w-3.5 text-[#B08A50] shrink-0" />
        <span className="text-[11px]">Was this dispatch relevant to you?</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleAnswer('yes')}
          disabled={isSubmitting}
          className={`neu-pill flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] uppercase font-bold cursor-pointer transition-all ${
            selectedAnswer === 'yes'
              ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
              : 'bg-[#FAF6EF] border-[#E0D4C5] hover:border-emerald-300 text-[#34252A]'
          }`}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>Yes</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnswer('somewhat')}
          disabled={isSubmitting}
          className={`neu-pill flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] uppercase font-bold cursor-pointer transition-all ${
            selectedAnswer === 'somewhat'
              ? 'bg-amber-100 border-amber-400 text-amber-800'
              : 'bg-[#FAF6EF] border-[#E0D4C5] hover:border-amber-300 text-[#34252A]'
          }`}
        >
          <span>Somewhat</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnswer('no')}
          disabled={isSubmitting}
          className={`neu-pill flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] uppercase font-bold cursor-pointer transition-all ${
            selectedAnswer === 'no'
              ? 'bg-red-100 border-red-400 text-red-800'
              : 'bg-[#FAF6EF] border-[#E0D4C5] hover:border-red-300 text-[#34252A]'
          }`}
        >
          <ThumbsDown className="h-3 w-3" />
          <span>No</span>
        </button>
      </div>
    </div>
  )
}
