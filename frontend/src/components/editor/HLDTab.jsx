import { useCallback } from 'react'
import ArchitectureDiagram from '../diagram/ArchitectureDiagram'
import { Info, TrendingUp, CheckCircle2, XCircle, Activity, Cpu } from 'lucide-react'
import { Overline, TabHeader, Panel, PanelHeader, TabShell, TabEmpty } from './Section'

function SystemFlowWalkthrough({ flowText }) {
  if (!flowText) return null

  // Split by line to get sequential steps
  const steps = flowText.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  return (
    <Panel className="flex flex-col gap-4">
      <PanelHeader
        icon={Activity}
        tone="#10b981"
        title="System Data Flow & Walkthrough"
        description="How a request travels through the system, step by step."
      />
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
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 font-mono">
                    Step {idx + 1}
                  </span>
                </div>
                <p className="text-sm text-[#e2e8f0] leading-relaxed font-sans">{cleanStep}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export default function HLDTab({ design, onNodesChange, onEdgesChange, readOnly = false }) {
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
    <TabShell id="hld-tab" className="min-h-full">
      <TabHeader
        title="High Level Design"
        description="The architecture diagram, the flow through it, and the tradeoffs it implies."
      />

      {/* Architecture Diagram — keeps its own explicit height container */}
      <div className="rounded-xl overflow-hidden border border-[#2a2a3d] bg-[#0a0a0f] h-[70vh] max-h-[600px] min-h-[340px] relative">
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/30">
            <Overline className="!text-[#3b82f6]">High Level Design</Overline>
          </span>
        </div>
        <ArchitectureDiagram
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          readOnly={readOnly}
        />
      </div>

      {/* Summary */}
      {summary && (
        <Panel className="flex flex-col gap-3">
          <PanelHeader icon={Info} tone="#3b82f6" title="Architecture Overview" />
          <p className="text-[13px] text-[#94a3b8] leading-relaxed">{summary}</p>
        </Panel>
      )}

      {/* System Flow Walkthrough */}
      <SystemFlowWalkthrough flowText={design?.systemFlow} />

      {/* Scalability Notes */}
      {scalabilityNotes.length > 0 && (
        <Panel className="flex flex-col gap-4">
          <PanelHeader
            icon={TrendingUp}
            tone="#06b6d4"
            title="Scalability Notes"
            description="Constraints and growth levers worth keeping in view."
          />
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
        </Panel>
      )}

      {/* Tradeoffs */}
      {(tradeoffs.pros?.length > 0 || tradeoffs.cons?.length > 0) && (
        <Panel className="flex flex-col gap-4">
          <PanelHeader
            icon={CheckCircle2}
            tone="#4ade80"
            title="Tradeoffs"
            description="What this architecture buys, and what it costs."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="flex flex-col gap-3">
              <Overline className="!text-[#4ade80]">✓ Advantages</Overline>
              {tradeoffs.pros?.map((pro, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-[#0f0f18] border border-[#2a2a3d] border-l-[3px] border-l-[#16a34a] rounded-lg px-4 py-3"
                >
                  <CheckCircle2 size={14} className="text-[#4ade80] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#94a3b8] leading-snug">{pro}</p>
                </div>
              ))}
            </div>

            {/* Cons */}
            <div className="flex flex-col gap-3">
              <Overline className="!text-[#f87171]">✗ Tradeoffs</Overline>
              {tradeoffs.cons?.map((con, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-[#0f0f18] border border-[#2a2a3d] border-l-[3px] border-l-[#dc2626] rounded-lg px-4 py-3"
                >
                  <XCircle size={14} className="text-[#f87171] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#94a3b8] leading-snug">{con}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Design Decisions */}
      {design?.designDecisions?.length > 0 && (
        <Panel className="flex flex-col gap-4">
          <PanelHeader
            icon={Cpu}
            tone="#3b82f6"
            title="Key Architecture & Design Decisions"
            description="Each call, the reasoning behind it, and what was considered instead."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.designDecisions.map((dec, idx) => (
              <div key={idx} className="bg-[#0f0f18] border border-[#2a2a3d] rounded-xl p-5 hover:border-[#3b82f6]/30 transition-all duration-200">
                <Overline className="block mb-1 !text-[#3b82f6]">Decision #{idx + 1}</Overline>
                <h4 className="text-sm font-semibold text-[#f1f5f9] mb-2 leading-snug font-heading">
                  {dec.decision}
                </h4>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
                  <strong className="text-[#e2e8f0]">Rationale:</strong> {dec.rationale}
                </p>
                {dec.alternatives?.length > 0 && (
                  <div className="mb-2 bg-[#1a1a28] rounded-lg p-2.5 border border-[#2a2a3d]/50">
                    <Overline className="block mb-1">Alternatives Evaluated</Overline>
                    <div className="flex gap-1.5 flex-wrap">
                      {dec.alternatives.map((alt, aIdx) => (
                        <span key={aIdx} className="text-[11px] bg-[#0a0a0f] border border-[#2a2a3d] px-2 py-0.5 rounded text-[#94a3b8] font-mono">
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
        </Panel>
      )}

      {/* Empty state */}
      {!design && (
        <TabEmpty
          icon={Info}
          title="No design yet"
          description="Generate a design to see the architecture diagram, its data flow, and the tradeoffs behind it."
        />
      )}
    </TabShell>
  )
}
