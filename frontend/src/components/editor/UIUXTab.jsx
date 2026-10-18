import { useState } from 'react'
import {
  LayoutTemplate,
  GitBranch,
  Layers,
  Palette,
  Check,
  Copy,
  Smartphone,
  Eye,
  Component,
  Sparkles,
  Accessibility,
  ArrowRight,
} from 'lucide-react'
import { Overline, TabHeader, Panel, PanelHeader, TabShell, TabEmpty } from './Section'
import UserFlowDiagram from '../diagram/UserFlowDiagram'

function ColorSwatch({ label, value }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div
      onClick={handleCopy}
      className="group relative flex items-center gap-3 p-2.5 rounded-lg border border-[#2a2a3d] bg-[#1a1a28] hover:border-[#3b82f6]/50 cursor-pointer transition-all"
      title="Click to copy hex"
    >
      <div
        className="w-8 h-8 rounded-md border border-white/10 flex-shrink-0 shadow-sm"
        style={{ backgroundColor: value || '#1e293b' }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] truncate">
          {label}
        </div>
        <div className="text-xs font-mono text-[#f1f5f9] truncate">
          {value || 'N/A'}
        </div>
      </div>
      <div className="text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} />}
      </div>
    </div>
  )
}

export default function UIUXTab({ design }) {
  const [subTab, setSubTab] = useState('flows') // flows | screens | components | tokens
  const uiux = design?.uiux || {}
  const userFlows = uiux.userFlows || []
  const screens = uiux.screens || []
  const components = uiux.components || []
  const designSystem = uiux.designSystem || {}

  const hasContent =
    userFlows.length > 0 ||
    screens.length > 0 ||
    components.length > 0 ||
    Object.keys(designSystem).length > 0

  if (!hasContent) {
    return (
      <TabShell id="uiux-tab">
        <TabHeader
          title="UI/UX & Product Design"
          description="User flows, screen wireframe specifications, design components, and visual design tokens."
        />
        <TabEmpty
          icon={LayoutTemplate}
          title="No UI/UX blueprint generated yet"
          message="Run AI generation from the sidebar to automatically synthesize user flows, screen layouts, design systems, and component specs."
        />
      </TabShell>
    )
  }

  return (
    <TabShell id="uiux-tab">
      <TabHeader
        title="UI/UX & Product Design Blueprint"
        description="Complete interface specification: interactive user journeys, wireframe layouts, component architecture, and design tokens."
        actions={
          <div className="flex items-center gap-1 bg-[#1a1a28] border border-[#2a2a3d] p-1 rounded-xl">
            {[
              { id: 'flows', label: 'User Flows', icon: GitBranch, count: userFlows.length },
              { id: 'screens', label: 'Screens', icon: Smartphone, count: screens.length },
              { id: 'components', label: 'Components', icon: Component, count: components.length },
              { id: 'tokens', label: 'Design System', icon: Palette },
            ].map((t) => {
              const Icon = t.icon
              const active = subTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#2a2a3d]/50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                  {typeof t.count === 'number' && t.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        active ? 'bg-blue-800 text-blue-100' : 'bg-[#2a2a3d] text-[#94a3b8]'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        }
      />

      {/* ── Sub-Tab 1: User Flows ── */}
      {subTab === 'flows' && (
        <div className="space-y-6">
          <Panel padded={false} className="overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#2a2a3d]">
              <PanelHeader
                icon={GitBranch}
                tone="#3b82f6"
                title="User Flow Diagrams"
                description="Interactive graph representing screen transitions, triggers, and user decision paths."
              />
            </div>
            <div className="h-[480px] w-full bg-[#0a0a0f]">
              <UserFlowDiagram userFlows={userFlows} />
            </div>
          </Panel>

          {/* Flow Step-by-Step Breakdown */}
          {userFlows.map((flow, fIdx) => (
            <Panel key={flow.id || fIdx}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center">
                  {fIdx + 1}
                </span>
                <h3 className="text-sm font-semibold text-[#f1f5f9]">{flow.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {flow.steps?.map((step, sIdx) => (
                  <div
                    key={step.id || sIdx}
                    className="p-3 rounded-lg border border-[#2a2a3d] bg-[#1a1a28] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#94a3b8] mb-1">
                        <span className="font-semibold uppercase tracking-wider">Step {sIdx + 1}</span>
                        {sIdx < flow.steps.length - 1 && (
                          <ArrowRight size={12} className="text-blue-400" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-[#f1f5f9] mb-1">
                        {step.screen}
                      </div>
                      <p className="text-[12px] text-[#94a3b8] leading-relaxed">
                        {step.action}
                      </p>
                    </div>
                    {step.next && (
                      <div className="mt-3 pt-2 border-t border-[#2a2a3d] text-[11px] text-blue-400">
                        Next: {step.next}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* ── Sub-Tab 2: Screens & Layouts ── */}
      {subTab === 'screens' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {screens.map((screen, idx) => (
            <Panel key={idx} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#f1f5f9]">{screen.name}</h3>
                    <p className="text-xs text-[#94a3b8] mt-0.5">{screen.purpose}</p>
                  </div>
                  {screen.layout && (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-purple-400">
                      {screen.layout}
                    </span>
                  )}
                </div>

                {/* Wireframe Sections */}
                {screen.sections && screen.sections.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Overline>Wireframe Sections</Overline>
                    <div className="space-y-2 mt-1.5">
                      {screen.sections.map((sec, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-lg border border-[#2a2a3d] bg-[#1a1a28]/60 flex items-start gap-3"
                        >
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#2a2a3d] text-[#94a3b8]">
                            {sec.type || 'section'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-[#f1f5f9]">
                              {sec.label || 'Section'}
                            </div>
                            {sec.content && (
                              <p className="text-[12px] text-[#94a3b8] mt-0.5 leading-relaxed">
                                {sec.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Interactions */}
                {screen.keyInteractions && screen.keyInteractions.length > 0 && (
                  <div className="mt-4">
                    <Overline>Key Interactions</Overline>
                    <ul className="mt-1.5 space-y-1">
                      {screen.keyInteractions.map((act, aIdx) => (
                        <li key={aIdx} className="text-xs text-[#94a3b8] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Accessibility Notes */}
              {screen.a11yNotes && screen.a11yNotes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#2a2a3d] flex items-start gap-2 text-[12px] text-emerald-400/90">
                  <Accessibility size={15} className="flex-shrink-0 mt-0.5 text-emerald-400" />
                  <span>{screen.a11yNotes.join(' · ')}</span>
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      {/* ── Sub-Tab 3: Design Components ── */}
      {subTab === 'components' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((comp, idx) => {
              const complexityColor =
                comp.complexity?.toLowerCase() === 'complex'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : comp.complexity?.toLowerCase() === 'medium'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'

              return (
                <Panel key={idx} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-semibold uppercase text-blue-400">
                        {comp.group || 'General'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {comp.reusable && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Reusable
                          </span>
                        )}
                        {comp.complexity && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${complexityColor}`}
                          >
                            {comp.complexity}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[#f1f5f9] mb-1">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      {comp.description}
                    </p>
                  </div>
                </Panel>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Sub-Tab 4: Design Tokens & System ── */}
      {subTab === 'tokens' && (
        <div className="space-y-6">
          {/* Color Palette */}
          {designSystem.colors && (
            <Panel>
              <PanelHeader
                icon={Palette}
                tone="#8b5cf6"
                title="Color Tokens"
                description="Semantic and brand color tokens configured for consistent visual hierarchy."
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                {Object.entries(designSystem.colors).map(([name, hex]) => (
                  <ColorSwatch key={name} label={name} value={hex} />
                ))}
              </div>
            </Panel>
          )}

          {/* Typography Scale */}
          {designSystem.typography && (
            <Panel>
              <PanelHeader
                icon={LayoutTemplate}
                tone="#3b82f6"
                title="Typography System"
                description={`Heading: ${designSystem.typography.headingFont || 'Space Grotesk'} · Body: ${designSystem.typography.bodyFont || 'Inter'}`}
              />
              {designSystem.typography.scale && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {Object.entries(designSystem.typography.scale).map(([name, size]) => (
                    <div
                      key={name}
                      className="p-3 rounded-lg border border-[#2a2a3d] bg-[#1a1a28] text-center"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                        {name}
                      </div>
                      <div className="text-sm font-mono text-[#f1f5f9] mt-1">{size}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {/* Spacing & Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {designSystem.spacing && (
              <Panel>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
                  Spacing Scale (Base {designSystem.spacing.base || '4px'})
                </div>
                <div className="flex flex-wrap gap-2">
                  {(designSystem.spacing.scale || [4, 8, 12, 16, 24, 32, 48, 64]).map((step) => (
                    <span
                      key={step}
                      className="px-2.5 py-1 rounded bg-[#1a1a28] border border-[#2a2a3d] font-mono text-xs text-[#f1f5f9]"
                    >
                      {step}px
                    </span>
                  ))}
                </div>
              </Panel>
            )}

            {designSystem.borderRadius && (
              <Panel>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
                  Border Radius Scale
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(designSystem.borderRadius).map(([name, val]) => (
                    <div
                      key={name}
                      className="p-2 rounded bg-[#1a1a28] border border-[#2a2a3d] text-center"
                    >
                      <span className="text-[11px] text-[#94a3b8] uppercase">{name}</span>
                      <div className="text-xs font-mono text-[#f1f5f9]">{val}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          {/* Rationale */}
          {designSystem.rationale && (
            <Panel className="border-blue-500/20 bg-blue-500/5">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Design System Rationale
                  </h4>
                  <p className="text-xs text-[#e2e8f0] leading-relaxed mt-1">
                    {designSystem.rationale}
                  </p>
                </div>
              </div>
            </Panel>
          )}
        </div>
      )}
    </TabShell>
  )
}
