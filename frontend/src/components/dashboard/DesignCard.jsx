import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Star, Boxes, AlertCircle, RefreshCw } from 'lucide-react'
import useDesignStore from '../../store/designStore'

const TAG_COLORS = [
  { bg: '#1e3a5f', text: '#60a5fa', border: '#3b82f630' },
  { bg: '#3b0764', text: '#c084fc', border: '#9333ea30' },
  { bg: '#14532d', text: '#4ade80', border: '#16a34a30' },
  { bg: '#431407', text: '#fb923c', border: '#c2410c30' },
  { bg: '#422006', text: '#fbbf24', border: '#d9770630' },
  { bg: '#500724', text: '#f9a8d4', border: '#ec489930' },
]

function TechTag({ label, colorIndex }) {
  const c = TAG_COLORS[colorIndex % TAG_COLORS.length]
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium leading-none"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {label}
    </span>
  )
}

export default function DesignCard({ design, onDelete }) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const tags = design.techPreferences || design.tags || []
  const visibleTags = tags.slice(0, 4)
  const extraCount = tags.length - visibleTags.length

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this design? This action cannot be undone.')) return
    setIsDeleting(true)
    try {
      await onDelete?.(design._id || design.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStar = (e) => {
    e.stopPropagation()
    useDesignStore.getState().toggleStarred(design._id || design.id, !design.starred)
  }

  const timeAgo = design.createdAt
    ? formatDistanceToNow(new Date(design.createdAt), { addSuffix: true })
    : 'recently'

  const isGenerated = design.status === 'generated' || design.hld?.nodes?.length > 0
  const isError = design.status === 'error' || design.status === 'failed'
  const nodeCount = design.hld?.nodes?.length || 0

  const statusDot = isError ? 'bg-red-400' : isGenerated ? 'bg-green-400' : 'bg-[#94a3b8]'
  const statusLabel = isError ? 'Failed' : isGenerated ? 'Generated' : 'Draft'

  /* The AI summary is the strongest differentiator between designs; fall
     back to the user's own requirements text on drafts that have neither. */
  const blurb = (design.summary || design.requirements || '').trim()
  const scale = design.constraints?.scale?.replace(/\s*scale\s*$/i, '').trim()

  return (
    <div
      onClick={() => navigate(`/editor/${design._id || design.id}`)}
      className="group bg-[#12121a] border border-[#2a2a3d] rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-150 hover:border-blue-500/35 hover:-translate-y-0.5"
    >
      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title + quiet icon actions */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug text-[#f1f5f9] min-w-0 truncate-2">
            {design.title || design.productName || 'Untitled Design'}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleToggleStar}
              title={design.starred ? 'Unstar' : 'Star this design'}
              aria-label={design.starred ? 'Unstar this design' : 'Star this design'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-yellow-400 hover:bg-[#1a1a28] transition-colors"
            >
              <Star
                size={15}
                className={design.starred ? 'text-yellow-400' : ''}
                fill={design.starred ? 'currentColor' : 'none'}
              />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete design"
              aria-label="Delete design"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-red-400 hover:bg-[#1a1a28] transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </div>
        </div>

        {/* What the system actually is — the real differentiator */}
        {blurb && (
          <p className="text-[13px] leading-relaxed text-[#94a3b8] truncate-2">
            {blurb}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-[#94a3b8] flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            {isError ? (
              <AlertCircle size={12} className="text-red-400" />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
            )}
            {statusLabel}
          </span>
          <span>{timeAgo}</span>
          {nodeCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Boxes size={12} aria-hidden="true" />
              {nodeCount} nodes
            </span>
          )}
          {scale && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono leading-none text-[#a5b4fc] bg-indigo-500/10 border border-indigo-500/25">
              {scale}
            </span>
          )}
          {isError && (
            <span className="inline-flex items-center gap-1 text-red-400">
              <RefreshCw size={12} aria-hidden="true" />
              Open to retry
            </span>
          )}
        </div>

        {/* Tech tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {visibleTags.map((tag, i) => (
              <TechTag key={tag} label={tag} colorIndex={i} />
            ))}
            {extraCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium leading-none bg-[#1a1a28] text-[#94a3b8] border border-[#2a2a3d]">
                +{extraCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
