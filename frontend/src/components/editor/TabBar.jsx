import { FileText } from 'lucide-react'

const TABS = [
  { id: 'hld', label: 'HLD' },
  { id: 'lld', label: 'LLD' },
  { id: 'database', label: 'Database' },
  { id: 'apis', label: 'APIs' },
  { id: 'scalability', label: 'Scalability' },
  { id: 'challenge', label: 'Challenge 🔥' },
  { id: 'history', label: 'History 🕒' },
]

export default function TabBar({
  activeTab = 'hld',
  onTabChange,
  onExportPDF,
  hasDesign = false,
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#2a2a3d] bg-[#12121a] px-4 min-h-[48px] flex-shrink-0">
      {/* Tabs */}
      <div className="flex items-end h-full gap-0 overflow-x-auto no-scrollbar flex-1 min-w-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-all duration-150 whitespace-nowrap focus:outline-none ${
                isActive
                  ? 'text-[#3b82f6]'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              {tab.label}
              {/* Active underline */}
              <span
                className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-t transition-all duration-150 ${
                  isActive ? 'bg-[#3b82f6]' : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>

      {/* Export Controls */}
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onExportPDF}
          disabled={!hasDesign}
          title="Export as PDF"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#2a2a3d] bg-[#1a1a28] text-[#94a3b8] hover:border-[#3b82f6]/60 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <FileText size={13} />
          PDF
        </button>
      </div>
    </div>
  )
}
