import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  Plus,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Loader2,
  Calendar,
  Star,
  Filter,
  X,
  Sparkles,
  Crown,
  LayoutGrid,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useDesignStore from '../store/designStore'
import StatsBar from '../components/dashboard/StatsBar'
import DesignCard from '../components/dashboard/DesignCard'
import { ARCHITECTURE_TEMPLATES } from '../utils/templates'
import { CardSkeleton } from '../components/shared/LoadingSkeleton'

/* ─────────────────────────── Skeleton Card ─────────────────────────── */



/* ─────────────────────────── New Design Modal ─────────────────────────── */

const NewDesignModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCreate = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setIsCreating(true)
    try {
      if (selectedTemplate) {
        await onCreate({
          title: trimmed,
          productName: selectedTemplate.productName,
          requirements: requirements || selectedTemplate.requirements || `Architecture based on ${selectedTemplate.title}`,
          constraints: selectedTemplate.constraints,
          status: selectedTemplate.status,
          hld: selectedTemplate.hld,
          lld: selectedTemplate.lld,
          database: selectedTemplate.database,
          scalability: selectedTemplate.scalability,
          uiux: selectedTemplate.uiux,
          challengeMode: selectedTemplate.challengeMode
        })
      } else {
        await onCreate({ title: trimmed, productName: trimmed, requirements })
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl)
    setName(tpl.title)
    setRequirements(tpl.requirements || '')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#12121a] border border-[#2a2a3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a3d] bg-[#12121a]/95 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-[#f1f5f9]">Create Architecture</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[#1a1a28] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
              Project Title / Product Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (selectedTemplate && e.target.value !== selectedTemplate.title) {
                  setSelectedTemplate(null)
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Ridesharing platform, E-Commerce Platform…"
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/40 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
              Detailed Requirements (Optional)
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe specific features, constraints, expected scale, etc..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/40 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 resize-none"
            />
          </div>

          <div className="border-t border-[#2a2a3d] pt-6">
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">
              Or initialize instantly from a Blueprint Preset
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ARCHITECTURE_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`cursor-pointer rounded-xl border p-4 flex flex-col gap-2.5 transition-all duration-200 bg-[#161622]/40 hover:bg-[#1a1a28] ${
                      isSelected
                        ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-blue-950/10'
                        : 'border-[#2a2a3d] hover:border-[#3b82f6]/40'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#f1f5f9] leading-snug">{tpl.title}</h4>
                      <p className="text-[11px] text-[#94a3b8] mt-1.5 leading-relaxed line-clamp-3">
                        {tpl.description}
                      </p>
                    </div>
                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {tpl.constraints.techPreferences.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-1.5 py-0.5 rounded bg-[#1a1a28] border border-[#2a2a3d] text-[11px] text-[#94a3b8]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2a3d] bg-[#12121a]/95 flex-shrink-0">
          <button onClick={onClose} className="vesper-btn vesper-btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="vesper-btn vesper-btn-primary"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Initializing…
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Create Design
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── User Dropdown ─────────────────────────── */

const UserMenu = ({ user, onOpenProfile, onOpenSettings }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  const isPro = user?.plan === 'pro'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1a1a28] border border-transparent hover:border-[#2a2a3d] transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-[#f1f5f9] leading-tight">{user?.name || 'User'}</p>
          <div className="flex items-center gap-1">
            {isPro ? (
              <span className="text-[11px] font-bold text-yellow-400 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" />
                PRO
              </span>
            ) : (
              <span className="text-[11px] text-[#94a3b8]">Free Plan</span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#94a3b8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a3d]">
            <p className="text-xs font-semibold text-[#f1f5f9]">{user?.name}</p>
            <p className="text-xs text-[#94a3b8] truncate">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => {
                onOpenProfile?.()
                setOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28] transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => {
                onOpenSettings?.()
                setOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28] transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            {!isPro && (
              <button
                onClick={() => {
                  setOpen(false)
                  navigate('/upgrade')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </button>
            )}
          </div>
          <div className="p-1.5 border-t border-[#2a2a3d]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── Empty State ─────────────────────────── */

const EmptyState = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-[#12121a] border border-[#2a2a3d] flex items-center justify-center mb-6 shadow-xl">
      <BrainCircuit className="w-9 h-9 text-[#94a3b8]" />
    </div>
    <h3 className="font-heading text-xl font-bold text-[#f1f5f9] mb-2">No designs yet</h3>
    <p className="text-[#94a3b8] text-sm max-w-xs leading-relaxed mb-6">
      Create your first architecture blueprint. Describe any product and let AI do the heavy lifting.
    </p>
    <button onClick={onNew} className="vesper-btn vesper-btn-primary">
      <Plus className="w-4 h-4" />
      Create First Design
    </button>
  </div>
)

/* ─────────────────────────── Profile & Settings Modal ─────────────────────────── */

const ProfileSettingsModal = ({ onClose, user, activeTab = 'profile', designs = [] }) => {
  const [tab, setTab] = useState(activeTab)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  const isPro = user?.plan === 'pro'
  const usageCount = user?.designsGeneratedThisMonth ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#12121a] border border-[#2a2a3d] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a3d] bg-[#12121a]/95">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('profile')}
              className={`pb-1 text-sm font-bold border-b-2 transition-all ${
                tab === 'profile'
                  ? 'text-blue-400 border-blue-500'
                  : 'text-[#94a3b8] border-transparent hover:text-[#f1f5f9]'
              }`}
            >
              Account Profile
            </button>
            <button
              onClick={() => setTab('settings')}
              className={`pb-1 text-sm font-bold border-b-2 transition-all ${
                tab === 'settings'
                  ? 'text-blue-400 border-blue-500'
                  : 'text-[#94a3b8] border-transparent hover:text-[#f1f5f9]'
              }`}
            >
              System Settings
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[#1a1a28] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {tab === 'profile' ? (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/25">
                  {initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f1f5f9]">{user?.name || 'User'}</h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{user?.email || 'user@example.com'}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {isPro ? (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-bold flex items-center gap-0.5">
                        <Crown className="w-3 h-3" />
                        PRO PLAN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#1a1a28] border border-[#2a2a3d] text-[#94a3b8] text-[11px]">
                        FREE PLAN
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a1a28]/60 border border-[#2a2a3d] rounded-xl p-4">
                  <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1">
                    Total Blueprints
                  </span>
                  <span className="text-2xl font-bold text-[#f1f5f9]">{designs?.length || 0}</span>
                  <span className="text-[11px] text-[#94a3b8] block mt-0.5">Designs created</span>
                </div>
                <div className="bg-[#1a1a28]/60 border border-[#2a2a3d] rounded-xl p-4">
                  <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1">
                    AI Usage Limit
                  </span>
                  <span className="text-2xl font-bold text-[#f1f5f9]">
                    {isPro ? 'Unlimited' : `${usageCount}/3`}
                  </span>
                  <span className="text-[11px] text-[#94a3b8] block mt-0.5">
                    {isPro ? 'Generations this month' : 'Free designs this month'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Honest, read-only info — not fake interactive toggles */}
              <div className="space-y-3">
                <div className="bg-[#1a1a28]/40 border border-[#2a2a3d] rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-[#f1f5f9]">Canvas autosave</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">
                    Whiteboard changes on the Canvas tab save automatically about 800ms after
                    your last edit, and again the moment you switch away from the tab.
                  </p>
                </div>

                <div className="bg-[#1a1a28]/40 border border-[#2a2a3d] rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-[#f1f5f9]">AI model</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">
                    ArchMind generates every blueprint using Google Gemini 2.5 Flash. There's
                    currently no per-user model selection.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#2a2a3d] bg-[#12121a]/95">
          <button onClick={onClose} className="vesper-btn vesper-btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Dashboard ─────────────────────────── */

const filterOptions = [
  { value: 'all', label: 'All Designs', icon: LayoutGrid },
  { value: 'month', label: 'This Month', icon: Calendar },
  { value: 'starred', label: 'Starred', icon: Star },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, fetchMe } = useAuthStore()
  const { designs, isLoading, fetchDesigns, createDesign, deleteDesign } = useDesignStore()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)

  const [settingsTab, setSettingsTab] = useState('profile')
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  useEffect(() => {
    fetchDesigns()
    fetchMe()
  }, [fetchDesigns, fetchMe])

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCreate = async (payload) => {
    let designPayload
    if (typeof payload === 'object') {
      designPayload = payload
    } else {
      designPayload = { title: payload, productName: payload }
    }
    
    const result = await createDesign(designPayload)
    setShowModal(false)
    if (result?.success && (result?.design?._id || result?.design?.id)) {
      navigate(`/editor/${result.design._id || result.design.id}`)
    }
  }

  const handleDelete = async (id) => {
    await deleteDesign(id)
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filtered = (designs || []).filter((d) => {
    const matchesSearch = (d.title || d.productName || '').toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'month') return new Date(d.createdAt) >= startOfMonth
    if (filter === 'starred') return d.starred
    return true
  })

  const currentFilter = filterOptions.find((o) => o.value === filter)

  return (
    <div className="min-h-screen bg-black text-[#f1f5f9]">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <BrainCircuit className="w-4 h-4 text-white" />
            <span className="text-[15px] font-medium tracking-tight text-white">ArchMind</span>
          </div>
          <UserMenu
            user={user}
            onOpenProfile={() => {
              setSettingsTab('profile')
              setShowSettingsModal(true)
            }}
            onOpenSettings={() => {
              setSettingsTab('settings')
              setShowSettingsModal(true)
            }}
          />
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Stats bar */}
        <div className="mb-8">
          <StatsBar designs={designs} user={user} />
        </div>

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="vesper-display text-2xl text-[#f1f5f9]">My <span className="vesper-grad">Designs</span></h1>
            <p className="text-[#94a3b8] text-sm mt-0.5">
              {designs?.length || 0} architecture{designs?.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="vesper-btn vesper-btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Design
          </button>
        </div>

        {/* Search + Filter bar */}
        <div className="flex items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designs…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12121a] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/50 text-sm focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#f1f5f9]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12121a] border border-[#2a2a3d] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-blue-500/30 text-sm font-medium transition-all duration-200 whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              {currentFilter?.label}
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl z-30 overflow-hidden p-1.5">
                {filterOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => { setFilter(value); setFilterOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      filter === value
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          search ? (
            <div className="text-center py-20">
              <Search className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
              <h3 className="font-heading text-lg font-semibold text-[#f1f5f9] mb-1">No results found</h3>
              <p className="text-[#94a3b8] text-sm">No designs match "{search}"</p>
            </div>
          ) : (
            <EmptyState onNew={() => setShowModal(true)} />
          )
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((design) => (
              <DesignCard
                key={design._id || design.id}
                design={design}
                onOpen={() => navigate(`/editor/${design._id || design.id}`)}
                onDelete={() => handleDelete(design._id || design.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Design Modal */}
      {showModal && (
        <NewDesignModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}

      {/* Profile & Settings Modal */}
      {showSettingsModal && (
        <ProfileSettingsModal
          onClose={() => setShowSettingsModal(false)}
          user={user}
          activeTab={settingsTab}
          designs={designs}
        />
      )}
    </div>
  )
}

export default Dashboard
