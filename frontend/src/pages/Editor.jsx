import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
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
import RequirementsPanel from '../components/editor/RequirementsPanel'
import TabBar from '../components/editor/TabBar'
import HLDTab from '../components/editor/HLDTab'
import LLDTab from '../components/editor/LLDTab'
import DatabaseTab from '../components/editor/DatabaseTab'
import APITab from '../components/editor/APITab'
import ScalabilityTab from '../components/editor/ScalabilityTab'
import ChallengeTab from '../components/editor/ChallengeTab'
import HistoryTab from '../components/editor/HistoryTab'

/* ─────────────────────────── Upgrade Modal ─────────────────────────── */

const proPerksList = [
  'Unlimited designs',
  'Challenge Mode — find bottlenecks',
  'PDF Export',
  'OpenAPI YAML download',
  'Share links for your team',
  'Priority AI generation',
]

const UpgradeModal = ({ onClose }) => (
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
                <p className="text-xs text-[#94a3b8]">Unlock the full ArchMind experience</p>
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

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40">
            Upgrade to Pro — $19/mo
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

/* ─────────────────────────── Export Dropdown ─────────────────────────── */

const exportOptions = [
  { label: 'Export as PDF', icon: FileText, pro: true },
  { label: 'Copy OpenAPI YAML', icon: Copy, pro: true },
  { label: 'Export as JSON', icon: Globe, pro: false },
]

const ExportDropdown = ({ onUpgradeClick, isPro }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOption = (opt) => {
    if (opt.pro && !isPro) {
      setOpen(false)
      onUpgradeClick()
      return
    }
    // handle export
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3d] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-blue-500/30 text-sm font-medium transition-all duration-200"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
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
                <span className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-yellow-400">
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
        className="bg-[#1a1a28] border border-blue-500/50 rounded-lg px-3 py-1 text-[#f1f5f9] font-heading font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px] max-w-xs"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      className="group flex items-center gap-1.5 hover:bg-[#1a1a28] px-3 py-1 rounded-lg transition-colors"
    >
      <span className="font-heading font-semibold text-base text-[#f1f5f9] truncate max-w-[200px] lg:max-w-xs">
        {value || 'Untitled Design'}
      </span>
      <Pencil className="w-3.5 h-3.5 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

/* ─────────────────────────── Save Status ─────────────────────────── */

const SaveStatus = ({ status }) => {
  if (status === 'saving') return (
    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
      <Loader2 className="w-3 h-3 animate-spin" />
      Saving…
    </div>
  )
  if (status === 'saved') return (
    <div className="flex items-center gap-1.5 text-xs text-green-400">
      <CheckCircle className="w-3 h-3" />
      Saved
    </div>
  )
  if (status === 'error') return (
    <div className="flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle className="w-3 h-3" />
      Save failed
    </div>
  )
  return null
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
    generationStepIndex,
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
  const [saveStatus, setSaveStatus] = useState(null) // 'saving' | 'saved' | 'error' | null
  const [activeTab, setActiveTab] = useState('hld')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const saveStatusTimeout = useRef(null)

  /* load design */
  useEffect(() => {
    if (id) {
      fetchDesign(id)
    } else {
      setCurrentDesign(null)
    }
    fetchMe()
  }, [id, fetchDesign, setCurrentDesign, fetchMe])

  /* watch for UPGRADE_REQUIRED errors */
  useEffect(() => {
    if (error && error.includes('UPGRADE_REQUIRED')) {
      setShowUpgrade(true)
    }
  }, [error])

  /* track isSaving → update saveStatus */
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving')
      clearTimeout(saveStatusTimeout.current)
    }
  }, [isSaving])

  const handleSave = useCallback(async () => {
    if (!currentDesign) return
    setSaveStatus('saving')
    clearTimeout(saveStatusTimeout.current)
    try {
      await updateDesign(currentDesign._id || currentDesign.id, {
        title: currentDesign.title,
        requirements: currentDesign.requirements,
        hld: currentDesign.hld,
      })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    } finally {
      saveStatusTimeout.current = setTimeout(() => setSaveStatus(null), 3000)
    }
  }, [currentDesign, updateDesign])

  const handleTitleChange = (newTitle) => {
    if (!currentDesign) return
    setCurrentDesign({ ...currentDesign, title: newTitle })
  }

  const handleTitleBlur = () => {
    handleSave()
  }

  const handleGenerate = async (inputs) => {
    try {
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
      await generateDesign(designId, formattedInputs)
    } catch (err) {
      if (err?.message?.includes('UPGRADE_REQUIRED')) {
        setShowUpgrade(true)
      }
    }
  }

  const isPro = user?.plan === 'pro'

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
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-shrink-0 w-8 h-8 rounded-lg border border-[#2a2a3d] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:border-blue-500/30 hover:bg-[#12121a] transition-all duration-200"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(v => !v)}
              className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] transition-all duration-200 ${
                isSidebarOpen ? 'border-blue-500/30 text-blue-400 bg-blue-500/5 hover:border-blue-500/50' : 'border-[#2a2a3d] hover:border-blue-500/30 hover:bg-[#12121a]'
              }`}
              title={isSidebarOpen ? "Hide requirements sidebar" : "Show requirements sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <BrainCircuit className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="w-px h-4 bg-[#2a2a3d]" />

            {/* Editable title */}
            <div className="min-w-0 ml-2">
              <EditableTitle
                value={currentDesign?.title || 'Untitled Design'}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
              />
            </div>

            {/* Save status */}
            <div className="hidden sm:block ml-2">
              <SaveStatus status={saveStatus} />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving || !currentDesign}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3d] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-blue-500/30 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </button>

            <ExportDropdown
              onUpgradeClick={() => setShowUpgrade(true)}
              isPro={isPro}
            />

            <button
              onClick={() => setShowUpgrade(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3d] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-blue-500/30 text-sm font-medium transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setShowUpgrade(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/15 transition-colors text-xs font-bold"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pro</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left: Requirements Panel */}
          <aside className={`transition-all duration-300 ease-in-out flex-shrink-0 border-r border-[#2a2a3d] flex flex-col min-h-0 bg-[#0d0d15] ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden !border-r-0'}`}>
            <div className="w-80 flex flex-col flex-1 min-h-0">
              <RequirementsPanel
                currentDesign={currentDesign}
                user={user}
                isGenerating={isGenerating}
                isChallenging={isChallenging}
                generationStep={generationStepIndex}
                onGenerate={handleGenerate}
                onChallenge={() => {
                  challengeDesign(currentDesign?._id || currentDesign?.id)
                }}
              />
            </div>
          </aside>

          {/* Right: Tab content */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0f]">
            {currentDesign ? (
              <>
                <TabBar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onUpgradeClick={() => setShowUpgrade(true)}
                  hasDesign={!!currentDesign}
                />
                
                {/* Active Tab Panel View */}
                <div className="flex-1 overflow-y-auto min-h-0">
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
                  {activeTab === 'challenge' && (
                    <ChallengeTab
                      design={currentDesign}
                      onChallenge={() => challengeDesign(currentDesign?._id || currentDesign?.id)}
                      isChallenging={isChallenging}
                      user={user}
                    />
                  )}
                  {activeTab === 'history' && (
                    <HistoryTab design={currentDesign} />
                  )}
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
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}

export default Editor
