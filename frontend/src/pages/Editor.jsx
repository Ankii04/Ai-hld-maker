import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Share2,
  Download,
  ChevronDown,
  Loader2,
  CheckCircle,
  Crown,
  X,
  Sparkles,
  FileText,
  Globe,
  Copy,
  BrainCircuit,
  AlertCircle,
  Pencil,
  Menu,
} from 'lucide-react'
import useDesignStore from '../store/designStore'
import useAuthStore from '../store/authStore'
import { toast } from 'react-hot-toast'
import { exportTabAsPDF, generateOpenAPIYAML } from '../utils/exportPDF'
import RequirementsPanel from '../components/editor/RequirementsPanel'
import TabBar from '../components/editor/TabBar'

// Each tab is a separate chunk, fetched only when the user actually opens
// it — the previous eager imports here put every tab (including the ~60KB
// SandboxTab source and dagre/xyflow-heavy diagram tabs) into one ~5MB
// initial editor bundle.
const HLDTab = lazy(() => import('../components/editor/HLDTab'))
const LLDTab = lazy(() => import('../components/editor/LLDTab'))
const DatabaseTab = lazy(() => import('../components/editor/DatabaseTab'))
const APITab = lazy(() => import('../components/editor/APITab'))
const ScalabilityTab = lazy(() => import('../components/editor/ScalabilityTab'))
const ChallengeTab = lazy(() => import('../components/editor/ChallengeTab'))
const HistoryTab = lazy(() => import('../components/editor/HistoryTab'))
const SandboxTab = lazy(() => import('../components/editor/SandboxTab'))
const CanvasTab = lazy(() => import('../components/editor/CanvasTab'))

const TabLoader = () => (
  <div className="flex-1 flex items-center justify-center py-24">
    <div className="spinner" />
  </div>
)


/* ─────────────────────────── Upgrade Modal ─────────────────────────── */

const proPerksList = [
  'Unlimited designs',
  'Challenge Mode — find bottlenecks',
  'PDF Export',
  'OpenAPI YAML download',
  'Share links for your team',
  'Priority AI generation',
]

const UpgradeModal = ({ onClose, reason }) => {
  const navigate = useNavigate()

  const handleUpgradeClick = () => {
    onClose()
    navigate('/upgrade')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        {/* Outer glow */}
        <div className="absolute -inset-px bg-gradient-to-r from-yellow-500/40 to-purple-500/40 rounded-2xl blur-[2px]" />
        <div className="relative bg-[#12121a] border border-yellow-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 border-b border-[#2a2a3d]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#f1f5f9]">Upgrade to Pro</h2>
                  <p className="text-xs text-[#94a3b8]">
                    {reason === 'limit'
                      ? "You've used all 3 free designs this month"
                      : 'Unlock the full ArchMind experience'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-[#1a1a28] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <div className="flex items-end gap-1 mb-5">
              <span className="text-4xl font-bold text-[#f1f5f9]">$19</span>
              <span className="text-[#94a3b8] mb-1">/month</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                7-day free trial
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {proPerksList.map((perk) => (
                <div key={perk} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-sm text-[#f1f5f9]">{perk}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgradeClick}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
            >
              See Pro Plans
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-[#94a3b8] text-sm hover:text-[#f1f5f9] transition-colors mt-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Export Dropdown ─────────────────────────── */

const exportOptions = [
  { label: 'Export as PDF', icon: FileText, pro: false },
  { label: 'Export as JSON', icon: Globe, pro: false },
  { label: 'Copy OpenAPI YAML', icon: Copy, pro: true },
]

const ExportDropdown = ({ currentDesign, activeTab, onUpgradeClick, isPro }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOption = async (opt) => {
    if (opt.pro && !isPro) {
      setOpen(false)
      onUpgradeClick()
      return
    }

    if (!currentDesign) {
      toast.error('No active design to export')
      setOpen(false)
      return
    }

    setOpen(false)

    try {
      if (opt.label === 'Export as PDF') {
        const elementId = `${activeTab}-tab`
        const filename = `${currentDesign.title || 'design'}-${activeTab}`
        const toastId = toast.loading('Exporting PDF...')
        await exportTabAsPDF(elementId, filename)
        toast.success('PDF downloaded successfully', { id: toastId })
      } else if (opt.label === 'Copy OpenAPI YAML') {
        const yaml = generateOpenAPIYAML(currentDesign)
        if (yaml) {
          await navigator.clipboard.writeText(yaml)
          toast.success('OpenAPI YAML copied to clipboard')
        } else {
          toast.error('No services or API endpoints found to export')
        }
      } else if (opt.label === 'Export as JSON') {
        const jsonStr = JSON.stringify(currentDesign, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentDesign.title || 'design'}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Design JSON downloaded')
      }
    } catch (err) {
      toast.error('Export failed')
      console.error('Export error:', err)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-secondary btn-sm"
      >
        <Download className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl z-30 overflow-hidden p-1.5">
          {exportOptions.map(({ label, icon: Icon, pro }) => (
            <button
              key={label}
              onClick={() => handleOption({ label, icon: Icon, pro })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28] transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
              {pro && !isPro && (
                <span className="ml-auto flex items-center gap-0.5 text-[11px] font-bold text-yellow-400">
                  <Crown className="w-2.5 h-2.5" />
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── Editable Title ─────────────────────────── */

const EditableTitle = ({ value, onChange, onBlur }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const startEdit = () => {
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 10)
  }

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onChange(trimmed)
    else setDraft(value)
    setEditing(false)
    onBlur?.()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') { setDraft(value); setEditing(false) }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKey}
        className="bg-[#1a1a28] border border-blue-500/50 rounded-lg px-2 py-1 text-[#f1f5f9] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[200px] max-w-md"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      title="Click to rename"
      className="group flex items-center gap-2 px-2 py-1 -mx-2 rounded-lg border-b border-dashed border-transparent hover:border-[#3a3a55] transition-colors min-w-0"
    >
      <span className="font-medium text-sm text-[#f1f5f9] truncate max-w-[160px] sm:max-w-[280px] lg:max-w-md">
        {value || 'Untitled Design'}
      </span>
      <Pencil className="w-3 h-3 flex-shrink-0 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

/* ─────────────────────────── Autosave Status ─────────────────────────── */

const formatAgo = (ts) => {
  if (!ts) return null
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

const AutosaveStatus = ({ status, lastSavedAt }) => {
  // Re-render every 30s so the "Xm ago" text stays honest
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((x) => x + 1), 30000)
    return () => clearInterval(t)
  }, [])

  if (status === 'saving') return (
    <span className="flex items-center gap-1.5 text-xs text-[#94a3b8] whitespace-nowrap">
      <Loader2 className="w-3 h-3 animate-spin" />
      Saving…
    </span>
  )
  if (status === 'error') return (
    <span className="flex items-center gap-1.5 text-xs text-red-400 whitespace-nowrap">
      <AlertCircle className="w-3 h-3" />
      Save failed
    </span>
  )
  const ago = formatAgo(lastSavedAt)
  if (!ago) return null
  return (
    <span className="flex items-center gap-2 text-xs text-[#94a3b8] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
      Saved · {ago}
    </span>
  )
}

/* ─────────────────────────── Loading / Error States ─────────────────────────── */

const LoadingScreen = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30 animate-pulse">
        <BrainCircuit className="w-8 h-8 text-white" />
      </div>
      <p className="text-[#94a3b8] text-sm font-mono">Loading design…</p>
    </div>
  </div>
)

/* ─────────────────────────── Editor ─────────────────────────── */

const Editor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, fetchMe } = useAuthStore()
  const {
    currentDesign,
    isLoading,
    isSaving,
    isGenerating,
    isChallenging,
    generationStartedAt,
    error,
    fetchDesign,
    updateDesign,
    setCurrentDesign,
    generateDesign,
    challengeDesign,
    updateLocalNodes,
    updateLocalEdges,
  } = useDesignStore()

  const [showUpgrade, setShowUpgrade] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saving' | 'error' | null
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [activeTab, setActiveTab] = useState('hld')
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const contentRef = useRef(null)

  /* Switching tab collapses the requirements sidebar (it's only needed while
     configuring generation, and otherwise steals width from the content) and
     resets the panel scroll to the top — canvas/diagram tabs used to open
     mid-scroll because the previous tab's scroll offset was retained. */
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setIsSidebarOpen(false)
    requestAnimationFrame(() => { if (contentRef.current) contentRef.current.scrollTop = 0 })
  }, [])

  /* load design */
  useEffect(() => {
    if (id) {
      fetchDesign(id)
    } else {
      setCurrentDesign(null)
    }
    fetchMe()
  }, [id, fetchDesign, setCurrentDesign, fetchMe])

  const [limitReached, setLimitReached] = useState(false)

  const handleSave = useCallback(async () => {
    if (!currentDesign) return
    setSaveStatus('saving')
    const res = await updateDesign(currentDesign._id || currentDesign.id, {
      title: currentDesign.title,
      requirements: currentDesign.requirements,
      hld: currentDesign.hld,
    })
    if (res?.success) {
      setSaveStatus(null)
      setLastSavedAt(Date.now())
    } else {
      setSaveStatus('error')
    }
  }, [currentDesign, updateDesign])

  /* ── Autosave ─────────────────────────────────────────────
   * Debounced save whenever title/requirements/hld change. The first
   * snapshot per design id is the freshly-fetched state — skipped, so
   * loading a design never triggers a write. Replaces the manual Save
   * button; Ctrl+S still forces an immediate save. */
  const autosaveRef = useRef({ designId: null, snapshot: null })
  useEffect(() => {
    if (!currentDesign) return
    const designId = currentDesign._id || currentDesign.id
    const snapshot = JSON.stringify({
      t: currentDesign.title,
      r: currentDesign.requirements,
      h: currentDesign.hld,
    })

    if (autosaveRef.current.designId !== designId) {
      // New design loaded — baseline it, mark as saved-as-of-now
      autosaveRef.current = { designId, snapshot }
      setLastSavedAt(Date.now())
      return
    }
    if (autosaveRef.current.snapshot === snapshot) return

    const timer = setTimeout(() => {
      autosaveRef.current.snapshot = snapshot
      handleSave()
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentDesign, handleSave])

  const handleTitleChange = (newTitle) => {
    if (!currentDesign) return
    setCurrentDesign({ ...currentDesign, title: newTitle })
  }

  const handleTitleBlur = () => {
    // Autosave effect picks the change up; nothing to force here.
  }

  const handleGenerate = async (inputs) => {
    const designId = currentDesign?._id || currentDesign?.id
    const formattedInputs = {
      productName: inputs.productName,
      requirements: inputs.requirements,
      constraints: {
        scale: inputs.scale,
        budget: inputs.budget,
        expectedUsers: inputs.expectedUsers,
        techPreferences: inputs.techPreferences,
      }
    }
    const res = await generateDesign(designId, formattedInputs)
    if (res?.success) {
      toast.success('Blueprint generated successfully!')
      setActiveTab('hld')
    } else if (res?.code === 'MONTHLY_LIMIT_REACHED') {
      setLimitReached(true)
      setShowUpgrade(true)
    } else if (res?.code === 'UPGRADE_REQUIRED') {
      setShowUpgrade(true)
    } else if (res?.message) {
      toast.error(res.message)
    }
  }

  const isPro = user?.plan === 'pro'

  const handleShare = async () => {
    if (!currentDesign) return
    const designId = currentDesign._id || currentDesign.id
    const toastId = toast.loading('Generating share link...')
    try {
      const res = await useDesignStore.getState().shareDesign(designId)
      if (res.success) {
        const shareUrl = `${window.location.origin}/share/${res.shareId}`
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share link copied to clipboard', { id: toastId })
      } else if (res.code === 'UPGRADE_REQUIRED') {
        toast.dismiss(toastId)
        setShowUpgrade(true)
      } else {
        toast.error(res.message || 'Failed to generate share link', { id: toastId })
      }
    } catch (err) {
      toast.error('Failed to generate share link', { id: toastId })
    }
  }

  const handleExportPDF = async () => {
    if (!currentDesign) return
    const elementId = `${activeTab}-tab`
    const filename = `${currentDesign.title || 'design'}-${activeTab}`
    const toastId = toast.loading('Generating PDF...')
    try {
      await exportTabAsPDF(elementId, filename)
      toast.success('PDF downloaded successfully', { id: toastId })
    } catch (err) {
      toast.error('Failed to export PDF', { id: toastId })
      console.error('PDF export error:', err)
    }
  }

  /* keyboard shortcut: Ctrl+S */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-[#f1f5f9] overflow-hidden">
      {/* ── Fixed Header ── */}
      <header className="flex-shrink-0 border-b border-[#2a2a3d] bg-[#0a0a0f]/95 backdrop-blur-xl z-30">
        <div className="flex items-center justify-between px-5 h-14 gap-4">
          {/* Left: sidebar toggle + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(v => !v)}
              className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] transition-all duration-200 ${
                isSidebarOpen ? 'border-blue-500/30 text-blue-400 bg-blue-500/5 hover:border-blue-500/50' : 'border-[#2a2a3d] hover:border-[#3a3a55] hover:bg-[#12121a]'
              }`}
              title={isSidebarOpen ? "Hide requirements sidebar" : "Show requirements sidebar"}
              aria-label={isSidebarOpen ? "Hide requirements sidebar" : "Show requirements sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb: Dashboard / <editable title> */}
            <nav className="flex items-center gap-2 min-w-0" aria-label="Breadcrumb">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[13px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors whitespace-nowrap"
              >
                Dashboard
              </button>
              <span className="text-[13px] text-[#94a3b8]" aria-hidden="true">/</span>
              <div className="min-w-0">
                <EditableTitle
                  value={currentDesign?.title || 'Untitled Design'}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                />
              </div>
            </nav>
          </div>

          {/* Right: autosave status + quiet actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <AutosaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
            </div>

            <button
              onClick={handleShare}
              disabled={!currentDesign}
              className="btn btn-secondary btn-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <ExportDropdown
              currentDesign={currentDesign}
              activeTab={activeTab}
              onUpgradeClick={() => setShowUpgrade(true)}
              isPro={isPro}
            />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="flex flex-1 min-h-0 min-w-0">
          {/* Mobile Sidebar Backdrop */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm animate-fade-in" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Left: Requirements Panel */}
          <aside className={`transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col min-h-0 bg-[#0d0d15] border-[#2a2a3d] z-40 
            lg:relative lg:translate-x-0 lg:opacity-100 lg:border-r
            fixed inset-y-0 left-0 shadow-2xl lg:shadow-none
            ${isSidebarOpen 
              ? 'w-80 translate-x-0 opacity-100 border-r' 
              : 'w-80 lg:w-0 -translate-x-full lg:translate-x-0 opacity-0 lg:opacity-0 overflow-hidden lg:border-r-0 border-r-0'
            }`}
          >
            <div className="w-80 flex flex-col flex-1 min-h-0">
              <RequirementsPanel
                currentDesign={currentDesign}
                user={user}
                isGenerating={isGenerating}
                isChallenging={isChallenging}
                generationStartedAt={generationStartedAt}
                onGenerate={handleGenerate}
                onChallenge={() => {
                  challengeDesign(currentDesign?._id || currentDesign?.id)
                }}
                onToggleCollapse={() => setIsSidebarOpen(false)}
              />
            </div>
          </aside>

          {/* Right: Tab content */}
          {/* min-w-0 is load-bearing: a flex item's default min-width:auto
              refuses to shrink below its content's intrinsic width, so any
              tab with a wide diagram/table/pre pushed this whole pane (and
              the mobile viewport with it) wider than the screen. */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#0a0a0f]">
            {currentDesign ? (
              <>
                <TabBar
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onExportPDF={handleExportPDF}
                  hasDesign={!!currentDesign}
                  design={currentDesign}
                />

                {/* Active Tab Panel View */}
                <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0">
                  <Suspense fallback={<TabLoader />}>
                    {activeTab === 'hld' && (
                      <HLDTab
                        design={currentDesign}
                        onNodesChange={updateLocalNodes}
                        onEdgesChange={updateLocalEdges}
                      />
                    )}
                    {activeTab === 'lld' && <LLDTab design={currentDesign} />}
                    {activeTab === 'database' && <DatabaseTab design={currentDesign} />}
                    {activeTab === 'apis' && <APITab design={currentDesign} />}
                    {activeTab === 'scalability' && <ScalabilityTab design={currentDesign} />}
                    {activeTab === 'canvas' && <CanvasTab design={currentDesign} />}
                    {activeTab === 'challenge' && (
                      <ChallengeTab
                        design={currentDesign}
                        onChallenge={() => challengeDesign(currentDesign?._id || currentDesign?.id)}
                        isChallenging={isChallenging}
                        user={user}
                      />
                    )}
                    {activeTab === 'sandbox' && (
                      <SandboxTab design={currentDesign} />
                    )}
                    {activeTab === 'history' && (
                      <HistoryTab design={currentDesign} />
                    )}
                  </Suspense>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#12121a] border border-[#2a2a3d] flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-[#94a3b8]" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#f1f5f9] mb-2">No design loaded</h3>
                  <p className="text-[#94a3b8] text-sm">
                    Go back to{' '}
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Dashboard
                    </button>{' '}
                    to select or create a design.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => { setShowUpgrade(false); setLimitReached(false) }}
          reason={limitReached ? 'limit' : undefined}
        />
      )}
    </div>
  )
}

export default Editor
