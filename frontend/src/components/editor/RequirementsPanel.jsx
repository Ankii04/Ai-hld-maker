import { useState, useEffect } from 'react'
import {
  Sparkles,
  Zap,
  ChevronDown,
  CheckCircle2,
  Loader2,
  User,
} from 'lucide-react'

const TECH_OPTIONS = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Go', 'Java',
  'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'RabbitMQ',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Elasticsearch',
]

const GENERATION_STEPS = [
  'Analyzing requirements...',
  'Designing architecture...',
  'Creating database schema...',
  'Generating API contracts...',
  'Building UI/UX blueprints...',
  'Finalizing...',
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
  generationStep = 0,
  user = null,
}) {
  const [productName, setProductName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [scale, setScale] = useState('Startup')
  const [budget, setBudget] = useState('Medium')
  const [expectedUsers, setExpectedUsers] = useState('< 1K')
  const [selectedTechs, setSelectedTechs] = useState([])
  const [usersOpen, setUsersOpen] = useState(false)

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
      <div className="p-5 border-b border-[#2a2a3d]">
        <h2 className="text-[#f1f5f9] font-semibold text-base tracking-wide">
          System Requirements
        </h2>
        <p className="text-[#94a3b8] text-xs mt-1">
          Describe what you want to build
        </p>
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
            className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#4a4a6a] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-colors"
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
            className="w-full h-48 bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#4a4a6a] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-colors resize-none leading-relaxed"
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
                    : 'bg-[#1a1a28] border-[#2a2a3d] text-[#94a3b8] hover:border-[#4a4a6a] hover:text-[#f1f5f9]'
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
                    : 'bg-[#1a1a28] border-[#2a2a3d] text-[#94a3b8] hover:border-[#4a4a6a] hover:text-[#f1f5f9]'
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
              className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] flex items-center justify-between focus:outline-none focus:border-[#3b82f6] hover:border-[#4a4a6a] transition-colors"
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
                      : 'bg-[#1a1a28] border-[#2a2a3d] text-[#94a3b8] hover:border-[#4a4a6a] hover:text-[#f1f5f9]'
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
              <p className="text-[10px] text-[#4a4a6a] mt-0.5">designs this month</p>
            </div>
          </div>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <div className="bg-[#1a1a28] border border-[#3b82f6]/30 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-[#3b82f6] mb-3 uppercase tracking-wider">
              Generating…
            </p>
            {GENERATION_STEPS.map((step, idx) => {
              const isDone = idx < generationStep
              const isActive = idx === generationStep
              return (
                <div key={step} className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 size={14} className="text-[#16a34a]" />
                    ) : isActive ? (
                      <Loader2 size={14} className="text-[#3b82f6] animate-spin" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-[#2a2a3d]" />
                    )}
                  </div>
                  <span
                    className={`text-xs transition-colors ${
                      isDone
                        ? 'text-[#4a4a6a] line-through'
                        : isActive
                        ? 'text-[#f1f5f9] font-medium'
                        : 'text-[#4a4a6a]'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-5 space-y-3 border-t border-[#2a2a3d]">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !requirements.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white shadow-lg shadow-[#3b82f6]/20 hover:shadow-[#3b82f6]/40 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#d97706] to-[#ea580c] text-white shadow-lg shadow-[#d97706]/20 hover:shadow-[#d97706]/40 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isChallenging ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Zap size={16} />
          )}
          {isChallenging ? 'Challenging…' : 'Challenge My Design'}
        </button>
      </div>
    </aside>
  )
}
