import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BrainCircuit, Eye, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import HLDTab from '../components/editor/HLDTab'
import LLDTab from '../components/editor/LLDTab'
import DatabaseTab from '../components/editor/DatabaseTab'
import APITab from '../components/editor/APITab'
import ScalabilityTab from '../components/editor/ScalabilityTab'

const TABS = ['HLD', 'LLD', 'Database', 'APIs', 'Scalability']

export default function PublicShare({ shareId: propShareId, readOnly }) {
  const { shareId: paramShareId } = useParams()
  const shareId = propShareId || paramShareId
  const [design, setDesign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('HLD')

  useEffect(() => {
    if (!shareId) return
    setLoading(true)
    api.get(`/designs/public/${shareId}`)
      .then(res => { setDesign(res.data); setLoading(false) })
      .catch(err => { setError(err.message || 'Design not found'); setLoading(false) })
  }, [shareId])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
        <p className="text-[#94a3b8] text-sm">Loading shared design…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-12 flex flex-col items-center gap-4 max-w-md">
        <AlertCircle size={48} className="text-[#ef4444]" />
        <h2 className="text-xl font-bold text-[#f1f5f9] font-heading">Design Not Found</h2>
        <p className="text-[#94a3b8] text-sm text-center">{error}</p>
        <a href="/" className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors">
          Go to ArchMind
        </a>
      </div>
    </div>
  )

  const renderTab = () => {
    switch (activeTab) {
      case 'HLD': return <HLDTab design={design} />
      case 'LLD': return <LLDTab design={design} />
      case 'Database': return <DatabaseTab design={design} />
      case 'APIs': return <APITab design={design} />
      case 'Scalability': return <ScalabilityTab design={design} />
      default: return <HLDTab design={design} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2a2a3d] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit size={24} className="text-[#3b82f6]" />
            <span className="font-bold font-heading bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ArchMind
            </span>
            <span className="hidden sm:inline text-[#4a5568] text-sm">/</span>
            <span className="hidden sm:inline text-[#94a3b8] text-sm truncate max-w-[200px]">{design?.title}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a28] border border-[#2a2a3d]">
            <Eye size={14} className="text-[#94a3b8]" />
            <span className="text-xs text-[#94a3b8]">Read-only view</span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="border-b border-[#2a2a3d] bg-[#0a0a0f]">
        <div className="max-w-screen-xl mx-auto px-6 flex gap-1 overflow-x-auto no-scrollbar flex-nowrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'text-[#3b82f6] border-[#3b82f6]'
                  : 'text-[#94a3b8] border-transparent hover:text-[#f1f5f9]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto max-w-screen-xl mx-auto w-full">
        {renderTab()}
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a2a3d] py-4 text-center">
        <p className="text-[#4a5568] text-xs">
          Shared via <a href="/" className="text-[#3b82f6] hover:underline">ArchMind</a> · AI-powered System Design Generator
        </p>
      </div>
    </div>
  )
}
