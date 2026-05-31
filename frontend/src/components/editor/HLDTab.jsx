import { useCallback } from 'react'
import ArchitectureDiagram from '../diagram/ArchitectureDiagram'
import { Info, TrendingUp, CheckCircle2, XCircle, Activity, Cpu, ArrowRight } from 'lucide-react'

function SystemFlowWalkthrough({ flowText }) {
  if (!flowText) return null

  // Split by line to get sequential steps
  const steps = flowText.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  return (
    <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5 mt-4">
      <h3 className="text-sm font-bold text-[#f1f5f9] mb-4 flex items-center gap-2 font-heading">
        <Activity size={15} className="text-[#10b981] animate-pulse" />
        System Data Flow & Walkthrough
      </h3>
      <div className="space-y-4 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#10b981] before:to-blue-500">
        {steps.map((step, idx) => {
          // Remove numbering prefix like "1. ", "Step 1:" if present
          const cleanStep = step.replace(/^(Step\s*\d+[:\-\s]*|\d+[\.\)\-\s]*)/i, '').trim()
          return (
            <div key={idx} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#0a0a0f] group-hover:scale-125 transition-transform duration-200 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              
              {/* Step Card */}
              <div className="bg-[#1a1a28] border border-[#2a2a3d] hover:border-[#10b981]/30 rounded-xl p-4 transition-all duration-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 font-mono">
                    Step {idx + 1}
                  </span>
                </div>
                <p className="text-sm text-[#e2e8f0] leading-relaxed font-sans">{cleanStep}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HLDTab({ design, onNodesChange, onEdgesChange }) {
  const hld = design?.hld || {}
  const nodes = hld.nodes || []
  const edges = hld.edges || []
  const summary = hld.summary || ''
  const scalabilityNotes = hld.scalabilityNotes || []
  // AI returns tradeoffs as [{pro, con}] array
  const tradeoffsRaw = hld.tradeoffs || []
  const tradeoffs = {
    pros: Array.isArray(tradeoffsRaw) ? tradeoffsRaw.map(t => t.pro).filter(Boolean) : (tradeoffsRaw.pros || []),
    cons: Array.isArray(tradeoffsRaw) ? tradeoffsRaw.map(t => t.con).filter(Boolean) : (tradeoffsRaw.cons || []),
  }

  const handleNodesChange = useCallback(
    (changes) => onNodesChange?.(changes),
    [onNodesChange]
  )
  const handleEdgesChange = useCallback(
    (changes) => onEdgesChange?.(changes),
    [onEdgesChange]
  )

  return (
    <div id="hld-tab" className="flex flex-col gap-6 p-6 min-h-full">
      {/* Architecture Diagram */}
      <div className="rounded-2xl overflow-hidden border border-[#2a2a3d] bg-[#0a0a0f] h-[600px] relative">
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30">
            High Level Design
          </span>
        </div>
        <ArchitectureDiagram
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
        />
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5 flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center mt-0.5">
            <Info size={16} className="text-[#3b82f6]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-1.5">Architecture Overview</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* System Flow Walkthrough */}
      <SystemFlowWalkthrough flowText={design?.systemFlow} />

      {/* Scalability Notes */}
      {scalabilityNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-[#06b6d4]" />
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Scalability Notes</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {scalabilityNotes.map((note, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/25 whitespace-nowrap"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tradeoffs */}
      {(tradeoffs.pros?.length > 0 || tradeoffs.cons?.length > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">Tradeoffs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#4ade80] uppercase tracking-wider mb-2">
                ✓ Advantages
              </p>
              {tradeoffs.pros?.map((pro, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-[#12121a] border border-[#2a2a3d] border-l-[3px] border-l-[#16a34a] rounded-lg px-4 py-3"
                >
                  <CheckCircle2 size={14} className="text-[#4ade80] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#94a3b8] leading-snug">{pro}</p>
                </div>
              ))}
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#f87171] uppercase tracking-wider mb-2">
                ✗ Tradeoffs
              </p>
              {tradeoffs.cons?.map((con, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-[#12121a] border border-[#2a2a3d] border-l-[3px] border-l-[#dc2626] rounded-lg px-4 py-3"
                >
                  <XCircle size={14} className="text-[#f87171] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#94a3b8] leading-snug">{con}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design Decisions */}
      {design?.designDecisions?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={15} className="text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Key Architecture & Design Decisions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.designDecisions.map((dec, idx) => (
              <div key={idx} className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5 hover:border-[#3b82f6]/30 transition-all duration-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#3b82f6] block mb-1">
                  Decision #{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-[#f1f5f9] mb-2 leading-snug font-heading">
                  {dec.decision}
                </h4>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
                  <strong className="text-[#e2e8f0]">Rationale:</strong> {dec.rationale}
                </p>
                {dec.alternatives?.length > 0 && (
                  <div className="mb-2 bg-[#1a1a28] rounded-lg p-2.5 border border-[#2a2a3d]/50">
                    <span className="text-[10px] font-bold text-[#4a4a6a] uppercase tracking-wider block mb-1">Alternatives Evaluated:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {dec.alternatives.map((alt, aIdx) => (
                        <span key={aIdx} className="text-[10px] bg-[#0a0a0f] border border-[#2a2a3d] px-2 py-0.5 rounded text-[#94a3b8] font-mono">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {dec.tradeoffs && (
                  <p className="text-xs text-[#f87171] leading-relaxed mt-2 border-t border-[#2a2a3d]/30 pt-2 font-sans">
                    <strong className="text-[#e2e8f0]">Trade-offs:</strong> {dec.tradeoffs}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!design && (
        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a28] border border-[#2a2a3d] flex items-center justify-center">
            <Info size={28} className="text-[#4a4a6a]" />
          </div>
          <p className="text-[#4a4a6a] text-sm">
            Generate a design to see the architecture diagram
          </p>
        </div>
      )}
    </div>
  )
}
