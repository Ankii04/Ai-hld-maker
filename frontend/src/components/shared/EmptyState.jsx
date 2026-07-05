import { Plus } from 'lucide-react'

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[#12121a] border border-[#2a2a3d] border-dashed rounded-2xl max-w-2xl mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-[#1a1a28] border border-[#2a2a3d] flex items-center justify-center mb-6 shadow-xl shadow-black/20">
      <Icon className="w-8 h-8 text-[#94a3b8]" />
    </div>
    <h3 className="font-heading text-xl font-bold text-[#f1f5f9] mb-2">{title}</h3>
    <p className="text-[#94a3b8] text-sm max-w-md mx-auto mb-8 leading-relaxed">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02]"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </button>
    )}
  </div>
)

export default EmptyState
