import { Square, Circle, Diamond, Type, Search } from 'lucide-react'

export default function CanvasToolbar({ onAddNode, onToggleSearch }) {
  const shapes = [
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'diamond', icon: Diamond, label: 'Diamond' },
    { type: 'text', icon: Type, label: 'Text' },
  ]

  return (
    <div className="flex flex-col gap-1.5 items-center bg-[#12121a] border border-[#2a2a3d] p-1.5 rounded-xl shadow-xl">
      {shapes.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onAddNode(type)}
          title={`Add ${label}`}
          className="p-2 rounded-lg text-[#94a3b8] hover:bg-[#1a1a28] hover:text-[#f1f5f9] transition-colors"
        >
          <Icon size={16} />
        </button>
      ))}
      <div className="w-6 h-px bg-[#2a2a3d]" />
      <button
        onClick={onToggleSearch}
        title="Search Tech Logos"
        className="p-2 rounded-lg text-blue-400 hover:bg-[#1a1a28] hover:text-blue-300 transition-colors"
      >
        <Search size={16} />
      </button>
    </div>
  )
}
