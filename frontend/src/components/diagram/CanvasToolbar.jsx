import { Square, Circle, Diamond, Type } from 'lucide-react'

export default function CanvasToolbar({ onAddNode }) {
  const shapes = [
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'diamond', icon: Diamond, label: 'Diamond' },
    { type: 'text', icon: Type, label: 'Text' },
  ]

  return (
    <div className="flex gap-1.5 items-center">
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
    </div>
  )
}
