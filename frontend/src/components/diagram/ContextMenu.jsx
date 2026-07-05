import { Trash2, Copy, ArrowUpToLine, ArrowDownToLine } from 'lucide-react'

export default function ContextMenu({ id, top, left, right, bottom, node, onClick, onDelete, onDuplicate, onBringToFront, onSendToBack }) {
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
      <div className="p-1 space-y-0.5">
        {id !== 'pane' && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onBringToFront(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#1a1a28] hover:text-[#f1f5f9] rounded-md transition-colors"
            >
              <ArrowUpToLine size={14} />
              Bring to Front
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSendToBack(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#1a1a28] hover:text-[#f1f5f9] rounded-md transition-colors"
            >
              <ArrowDownToLine size={14} />
              Send to Back
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#1a1a28] hover:text-[#f1f5f9] rounded-md transition-colors"
            >
              <Copy size={14} />
              Duplicate
            </button>
            <div className="h-px bg-[#2a2a3d] my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[#f87171] hover:bg-[#dc2626]/10 rounded-md transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
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
