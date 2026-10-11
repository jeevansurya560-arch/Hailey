import { useState } from 'react'
import { MessageSquare, Mic, Volume2, UserCheck, Heart, Send } from 'lucide-react'

/**
 * Author Talk concept providing deep oral history, cultural storytelling,
 * and direct audience interaction with verified creators.
 */
export function AuthorTalkSection({
  authorName = 'Kenjiro Takahashi',
  authorBio = 'Nishijin textile preservationist & living craft archivist in Kamigyo-ku, Kyoto.',
  storyTitle = 'The Whispering Looms: Forty Years of Persimmon Dyeing in Nishijin',
  storyContent = 'When the morning fog rolls down from Mount Hiei, the dampness in the air changes the tension of silk yarn on our wooden hand-looms. In modern synthetic manufacturing, this variation is considered an error. In Nishijin, it is the breath of the season. To dye with Kakishibu (unfermented bitter persimmon juice), one must surrender to the sunlight of mid-autumn...',
}) {
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Amina Diallo',
      text: 'The philosophy of allowing humidity to guide warp tension echoes West African Indigo resist-dyeing in Oshogbo.',
      time: '2 hours ago',
      likes: 5,
    },
    {
      id: 'c2',
      author: 'Marcus Vance',
      text: 'Does your guild still register the woodblock stencil patterns with the municipal archives?',
      time: '5 hours ago',
      likes: 3,
    },
  ])
  const [newComment, setNewComment] = useState('')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setComments((prev) => [
      ...prev,
      {
        id: 'c-' + Date.now(),
        author: 'Guest Contributor',
        text: newComment.trim(),
        time: 'Just now',
        likes: 0,
      },
    ])
    setNewComment('')
  }

  return (
    <section className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0D4C5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#6A1F35] text-[#FAF6EF] shadow-xs">
              Author Talk · Oral History
            </span>
            <span className="font-mono text-xs text-emerald-800 flex items-center gap-1 font-medium">
              <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
              Verified Culture Bearer
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#34252A]">
            {storyTitle}
          </h2>
          <p className="text-xs text-[#34252A]/70 mt-0.5">
            By <strong className="text-[#34252A]">{authorName}</strong> — {authorBio}
          </p>
        </div>

        {/* Audio Narration Toggle */}
        <button
          type="button"
          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
          className={`px-4 py-2 font-mono text-xs rounded-full flex items-center gap-2 cursor-pointer transition-all ${
            isPlayingAudio
              ? 'neu-burgundy-pill text-[#FAF6EF]'
              : 'neu-pill border border-[#E0D4C5] bg-[#F0E7DA] text-[#34252A] hover:bg-[#FAF6EF]'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="h-3.5 w-3.5 animate-pulse text-[#FAF6EF]" />
              <span>Playing Audio Note (03:42)</span>
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5 text-[#6A1F35]" />
              <span>Listen to Author Note</span>
            </>
          )}
        </button>
      </div>

      {/* Story Content */}
      <div className="text-base leading-relaxed text-[#34252A] space-y-3 font-serif">
        <p className="border-l-2 border-[#B08A50] pl-4 italic text-[#34252A]/90">
          "{storyContent}"
        </p>
      </div>

      {/* Community Interaction & Discussion */}
      <div className="pt-4 border-t border-[#E0D4C5] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-[#34252A] flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-[#6A1F35]" />
            <span>Audience Exchange ({comments.length})</span>
          </h3>
        </div>

        {/* Comments Feed */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="neu-card rounded-xl border border-[#E0D4C5] bg-[#F0E7DA] p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#34252A]">{c.author}</span>
                <span className="text-[#34252A]/60">{c.time}</span>
              </div>
              <p className="text-xs text-[#34252A] leading-relaxed">{c.text}</p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#6A1F35] pt-1 font-semibold">
                <Heart className="h-3 w-3 text-[#6A1F35]" />
                <span>{c.likes} endorsements</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Pose a question or reflection to the author..."
            className="flex-1 neu-inset-input rounded-full bg-[#F0E7DA] border border-[#E0D4C5] px-4 py-2.5 text-xs text-[#34252A] placeholder:text-[#34252A]/50 focus:outline-none focus:border-[#6A1F35] transition-all"
          />
          <button
            type="submit"
            className="neu-burgundy-pill rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-[#FAF6EF] cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5 text-[#FAF6EF]" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default AuthorTalkSection
