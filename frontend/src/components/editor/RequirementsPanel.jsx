import { useState, useEffect } from 'react'
import {
  Sparkles,
  Zap,
  ChevronDown,
  Loader2,
  User,
  ChevronLeft,
} from 'lucide-react'

const TECH_OPTIONS = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Go', 'Java',
  'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'RabbitMQ',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Elasticsearch',
]

const SCALE_OPTIONS = ['Startup', 'Mid-scale', 'Enterprise']
const BUDGET_OPTIONS = ['Low', 'Medium', 'High']
const USERS_OPTIONS = ['< 1K', '1K–100K', '100K–1M', '1M+']

export default function RequirementsPanel({
  onGenerate,
  onChallenge,
  isGenerating = false,
  isChallenging = false,
  currentDesign = null,
  generationStartedAt = null,
  user = null,
  onToggleCollapse,
}) {
  const [productName, setProductName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [scale, setScale] = useState('Startup')
  const [budget, setBudget] = useState('Medium')
  const [expectedUsers, setExpectedUsers] = useState('< 1K')
  const [selectedTechs, setSelectedTechs] = useState([])
  const [usersOpen, setUsersOpen] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Honest elapsed-time readout while generating — no fake step checklist
  // that loops back to "Analyzing requirements..." on any run slower than
  // a few seconds (real generations take 45-90s).
  useEffect(() => {
    if (!isGenerating || !generationStartedAt) {
      setElapsedSeconds(0)
      return
    }
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - generationStartedAt) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isGenerating, generationStartedAt])

  useEffect(() => {
    if (currentDesign) {
      setProductName(currentDesign.productName || currentDesign.title || '')
      setRequirements(currentDesign.requirements || '')
      if (currentDesign.constraints) {
        setScale(currentDesign.constraints.scale || 'Startup')
        setBudget(currentDesign.constraints.budget || 'Medium')
        setExpectedUsers(currentDesign.constraints.expectedUsers || '< 1K')
        setSelectedTechs(currentDesign.constraints.techPreferences || [])
      }
    }
  }, [currentDesign])

  const toggleTech = (tech) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  const handleGenerate = () => {
    if (!onGenerate) return
    onGenerate({
      productName,
      requirements,
      scale,
      budget,
      expectedUsers,
      techPreferences: selectedTechs,
    })
  }

  const hasDesign = !!currentDesign
  const isFree = user?.plan === 'free'
  const usageCount = user?.designsGeneratedThisMonth ?? 0

  return (
    <aside className="w-80 min-h-screen bg-[#12121a] border-r border-[#2a2a3d] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-[#2a2a3d] flex items-center justify-between">
        <div>
          <h2 className="text-[#f1f5f9] font-semibold text-base tracking-wide">
            System Requirements
          </h2>
          <p className="text-[#94a3b8] text-xs mt-1">
            Describe what you want to build
          </p>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#1a1a28] hover:text-[#f1f5f9] transition-colors"
            title="Collapse Panel"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 p-5 space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
            Product Name
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Uber for Pets"
            className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-colors"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
            Requirements
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe your system requirements..."
            rows={6}
            className="w-full h-48 bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Scale Selector */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
            Scale
          </label>
          <div className="flex gap-1.5">
            {SCALE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setScale(opt)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  scale === opt
                    ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]'
                    : 'bg-[#1a1a28] border-[#2a2a3d] text-[#94a3b8] hover:border-[#3a3a55] hover:text-[#f1f5f9]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Selector */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
            Budget
          </label>
          <div className="flex gap-1.5">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setBudget(opt)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  budget === opt
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#8b5cf6]'
                    : 'bg-[#1a1a28] border-[#2a2a3d] text-[#94a3b8] hover:border-[#3a3a55] hover:text-[#f1f5f9]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Expected Users Dropdown */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
            Expected Users
          </label>
          <div className="relative">
            <button
              onClick={() => setUsersOpen((v) => !v)}
              className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] flex items-center justify-between focus:outline-none focus:border-[#3b82f6] hover:border-[#3a3a55] transition-colors"
            >
              <span>{expectedUsers}</span>
              <ChevronDown
                size={14}
                className={`text-[#94a3b8] transition-transform ${usersOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {usersOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a28] border border-[#2a2a3d] rounded-lg overflow-hidden shadow-xl">
                {USERS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setExpectedUsers(opt)
                      setUsersOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      expectedUsers === opt
                        ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                        : 'text-[#94a3b8] hover:bg-[#2a2a3d] hover:text-[#f1f5f9]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tech Preferences */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5 uppercase tracking-wider">
            Tech Preferences
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TECH_OPTIONS.map((tech) => {
              const isSelected = selectedTechs.includes(tech)
              return (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]'
                      : 'bg-[#1a1a28] border-[#2a2a3d] text-[#94a3b8] hover:border-[#3a3a55] hover:text-[#f1f5f9]'
                  }`}
                >
                  {tech}
                </button>
              )
            })}
          </div>
        </div>

        {/* Free Plan Usage */}
        {isFree && (
          <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[#8b5cf6]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#94a3b8]">Free plan usage</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 bg-[#2a2a3d] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] transition-all"
                    style={{ width: `${Math.min((usageCount / 3) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#f1f5f9] whitespace-nowrap">
                  {usageCount}/3
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">designs this month</p>
            </div>
          </div>
        )}

        {/* Generation Progress — honest indeterminate state. This panel
            carries the app's ONE glow: the purple AI-generating pulse. */}
        {isGenerating && (
          <div className="ai-glow bg-[#1a1a28] border border-[#8b5cf6]/50 rounded-lg p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <Loader2 size={16} className="text-[#a78bfa] animate-spin flex-shrink-0" />
              <p className="text-[11px] font-semibold text-[#a78bfa] uppercase tracking-wider">
                Generating architecture…
              </p>
              <span className="ml-auto text-xs font-mono text-[#94a3b8]">
                {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:
                {String(elapsedSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Gemini is drafting your HLD, LLD, database schema, API contracts, and scalability
              guide. This typically takes 45–90 seconds.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-5 space-y-3 border-t border-[#2a2a3d]">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !requirements.trim()}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isGenerating ? 'ai-glow' : ''
          }`}
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {isGenerating ? 'Generating…' : 'Generate Architecture'}
        </button>

        <button
          onClick={onChallenge}
          disabled={!hasDesign || isChallenging || isGenerating}
          className="btn btn-secondary w-full"
        >
          {isChallenging ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Zap size={16} className="text-[#f59e0b]" />
          )}
          {isChallenging ? 'Challenging…' : 'Challenge My Design'}
        </button>
      </div>
    </aside>
  )
}
