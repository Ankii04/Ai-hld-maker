import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Edit3, Trash2, CheckCircle, Clock } from 'lucide-react'

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
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {label}
    </span>
  )
}

export default function DesignCard({ design, onDelete }) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [hovered, setHovered] = useState(false)

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

  const handleEdit = (e) => {
    e.stopPropagation()
    navigate(`/editor/${design._id || design.id}`)
  }

  const timeAgo = design.createdAt
    ? formatDistanceToNow(new Date(design.createdAt), { addSuffix: true })
    : 'recently'

  const isGenerated = design.status === 'generated' || design.hld

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/editor/${design._id || design.id}`)}
      className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-6 cursor-pointer flex flex-col gap-4 transition-all duration-200"
      style={{
        transform: hovered ? 'scale(1.015)' : 'scale(1)',
        boxShadow: hovered
          ? '0 0 0 1px #3b82f630, 0 8px 40px rgba(59,130,246,0.12)'
          : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {isGenerated ? (
            <CheckCircle size={12} className="text-[#4ade80]" />
          ) : (
            <Clock size={12} className="text-[#94a3b8]" />
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isGenerated ? 'text-[#4ade80]' : 'text-[#94a3b8]'
            }`}
          >
            {isGenerated ? 'Generated' : 'Draft'}
          </span>
        </div>
        <span className="text-[10px] text-[#4a4a6a]">{timeAgo}</span>
      </div>

      {/* Title */}
      <div>
        <h3
          className="text-base font-bold leading-snug transition-all duration-200"
          style={{
            background: hovered
              ? 'linear-gradient(135deg, #f1f5f9, #3b82f6)'
              : 'none',
            WebkitBackgroundClip: hovered ? 'text' : 'unset',
            WebkitTextFillColor: hovered ? 'transparent' : '#f1f5f9',
            color: hovered ? 'transparent' : '#f1f5f9',
          }}
        >
          {design.title || design.productName || 'Untitled Design'}
        </h3>
        {design.requirements && (
          <p
            className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {design.requirements}
          </p>
        )}
      </div>

      {/* Tech tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag, i) => (
            <TechTag key={tag} label={tag} colorIndex={i} />
          ))}
          {extraCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1a1a28] text-[#4a4a6a] border border-[#2a2a3d]">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#2a2a3d] mt-auto">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a28] border border-[#2a2a3d] text-[#94a3b8] hover:border-[#3b82f6]/60 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-all flex-1 justify-center"
        >
          <Edit3 size={12} />
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a28] border border-[#2a2a3d] text-[#94a3b8] hover:border-[#dc2626]/60 hover:text-[#f87171] hover:bg-[#dc2626]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <span className="w-3 h-3 border border-[#f87171] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
        </button>
      </div>
    </div>
  )
}
