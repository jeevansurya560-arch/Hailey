import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, HelpCircle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function RelevancePrompt({ userId, postId, initialAnswer = null }) {
  const [selectedAnswer, setSelectedAnswer] = useState(initialAnswer)
  const [isSubmitted, setIsSubmitted] = useState(initialAnswer !== null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswer = async (answer) => {
    if (isSubmitted || isSubmitting) return
    setSelectedAnswer(answer)
    setIsSubmitting(true)

    const { error } = await supabase
      .from('feedback')
      .upsert(
        { user_id: userId, post_id: postId, answer },
        { onConflict: 'user_id,post_id' }
      )

    setIsSubmitting(false)
    if (!error) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--paper)] border border-[var(--line)] font-mono text-[11px] text-[var(--moss)]">
        <Check className="h-3.5 w-3.5" />
        <span>Relevance feedback saved</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[var(--paper)] border border-dashed border-[var(--line)] font-mono text-xs text-[var(--ink)]">
      <div className="flex items-center gap-1.5 text-[var(--ink-2)]">
        <HelpCircle className="h-3.5 w-3.5 text-[var(--clay)] shrink-0" />
        <span className="text-[11px]">Was this dispatch relevant to you?</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleAnswer('yes')}
          disabled={isSubmitting}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] uppercase font-bold transition-colors ${
            selectedAnswer === 'yes'
              ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
              : 'border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)]'
          }`}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>Yes</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnswer('somewhat')}
          disabled={isSubmitting}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] uppercase font-bold transition-colors ${
            selectedAnswer === 'somewhat'
              ? 'bg-amber-100 border-amber-600 text-amber-800'
              : 'border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)]'
          }`}
        >
          <span>Somewhat</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnswer('no')}
          disabled={isSubmitting}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] uppercase font-bold transition-colors ${
            selectedAnswer === 'no'
              ? 'bg-red-100 border-red-600 text-red-800'
              : 'border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)]'
          }`}
        >
          <ThumbsDown className="h-3 w-3" />
          <span>No</span>
        </button>
      </div>
    </div>
  )
}
