import {
  FileText,
  Network,
  Boxes,
  Database,
  Code2,
  TrendingUp,
  Palette,
  FlaskConical,
  Flame,
  Clock,
} from 'lucide-react'

// Line icons instead of emoji: they render identically on every OS, sit on
// the type baseline, and can carry state (badges) — emoji can't.
const TABS = [
  { id: 'hld', label: 'HLD', icon: Network },
  { id: 'lld', label: 'LLD', icon: Boxes },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'apis', label: 'APIs', icon: Code2 },
  { id: 'scalability', label: 'Scalability', icon: TrendingUp },
  { id: 'canvas', label: 'Canvas', icon: Palette },
  { id: 'sandbox', label: 'Sandbox', icon: FlaskConical },
  { id: 'challenge', label: 'Challenge', icon: Flame },
  { id: 'history', label: 'History', icon: Clock },
]

export default function TabBar({
  activeTab = 'hld',
  onTabChange,
  onExportPDF,
  hasDesign = false,
  design = null,
}) {
  // Challenge findings count → badge
  const challenge = design?.challengeMode
  const challengeCount =
    (challenge?.bottlenecks?.length || 0) +
    (challenge?.spofs?.length || 0) +
    (challenge?.recommendations?.length || 0)

  return (
    <div className="flex items-center justify-between border-b border-[#2a2a3d] bg-[#12121a] px-4 min-h-[48px] flex-shrink-0">
      {/* Tabs */}
      <div role="tablist" className="flex items-stretch h-full gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-tab`}
              onClick={() => onTabChange?.(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-3 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-t-md ${
                isActive
                  ? 'text-[#60a5fa]'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
              {tab.label}
              {tab.id === 'challenge' && challengeCount > 0 && (
                <span className="text-[11px] font-semibold leading-none text-[#60a5fa] bg-blue-500/15 rounded-full px-1.5 py-0.5">
                  {challengeCount}
                </span>
              )}
              {/* Animated underline: scales in on hover, solid blue when active */}
              <span
                aria-hidden="true"
                className={`absolute left-3 right-3 bottom-0 h-[2px] rounded-t origin-center transition-transform duration-150 ${
                  isActive
                    ? 'bg-[#3b82f6] scale-x-100'
                    : 'bg-[#3a3a55] scale-x-0 group-hover:scale-x-100'
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
          title="Export current tab as PDF"
          className="btn btn-secondary btn-sm"
        >
          <FileText size={13} />
          PDF
        </button>
      </div>
    </div>
  )
}
