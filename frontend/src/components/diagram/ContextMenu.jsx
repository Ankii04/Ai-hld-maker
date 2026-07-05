import { Trash2 } from 'lucide-react'

export default function ContextMenu({ id, top, left, right, bottom, node, onClick, onDelete }) {
  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-50 bg-[#12121a] border border-[#2a2a3d] rounded-lg shadow-xl w-48 overflow-hidden"
      onClick={onClick}
    >
      {id !== 'pane' && (
        <div className="p-2 border-b border-[#2a2a3d] bg-[#1a1a28]">
          <p className="text-xs text-[#94a3b8] truncate font-medium">
            Node: <span className="text-[#f1f5f9]">{node?.data?.label || id}</span>
          </p>
        </div>
      )}
      <div className="p-1">
        {id !== 'pane' && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f87171] hover:bg-[#dc2626]/10 rounded-md transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
        {id === 'pane' && (
          <p className="px-3 py-2 text-xs text-[#94a3b8]">
            Right-click a node for options
          </p>
        )}
      </div>
    </div>
  )
}
