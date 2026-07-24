import { useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ServiceNode } from '../diagram/CustomNodes'
import { Server, ArrowRight, Tag, Cpu, Network, Activity, Layers } from 'lucide-react'
import dagre from 'dagre'
import { Overline, TabHeader, Panel, PanelHeader, TabShell, TabEmpty } from './Section'

const METHOD_COLORS = {
  GET:    { bg: '#14532d', text: '#4ade80', border: '#16a34a' },
  POST:   { bg: '#1e3a5f', text: '#60a5fa', border: '#3b82f6' },
  PUT:    { bg: '#422006', text: '#fbbf24', border: '#d97706' },
  DELETE: { bg: '#450a0a', text: '#f87171', border: '#dc2626' },
  PATCH:  { bg: '#3b0764', text: '#c084fc', border: '#9333ea' },
}

function MethodBadge({ method }) {
  const colors = METHOD_COLORS[method?.toUpperCase()] || METHOD_COLORS['GET']
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}44`,
      }}
    >
      {method}
    </span>
  )
}

function buildServiceGraph(services = []) {
  const nodes = []
  const edges = []

  services.forEach((svc) => {
    nodes.push({
      id: svc.name,
      type: 'service',
      position: { x: 0, y: 0 },
      data: {
        label: svc.name,
        description: svc.responsibility || '',
        technology: svc.technology || '',
      },
    })
    svc.dependencies?.forEach((dep) => {
      edges.push({
        id: `${svc.name}->${dep}`,
        source: svc.name,
        target: dep,
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        style: { stroke: '#3b82f64d', strokeWidth: 1.5 },
      })
    })
  })

  // Apply Dagre Layout to calculate position coordinates
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 120, ranksep: 180 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 80 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const pos = dagreGraph.node(node.id)
    node.position = {
      x: pos.x - 110,
      y: pos.y - 40,
    }
  })

  return { nodes, edges }
}

const lldNodeTypes = { service: ServiceNode }

export default function LLDTab({ design }) {
  const services = design?.lld?.services || []
  const [selectedSvc, setSelectedSvc] = useState(services[0]?.name || '')
  const currentService = services.find((s) => s.name === selectedSvc) || services[0]

  const { nodes, edges } = buildServiceGraph(services)
  const [rfNodes, , onNodesChange] = useNodesState(nodes)
  const [rfEdges, , onEdgesChange] = useEdgesState(edges)

  if (!design) {
    return (
      <TabEmpty
        icon={Layers}
        title="No low-level design yet"
        description="Generate a design to see LLD details."
      />
    )
  }

  return (
    <TabShell id="lld-tab">
      <TabHeader
        title="Low-Level Design"
        description={`Service internals, endpoint contracts and class structure${
          services.length ? ` across ${services.length} service${services.length === 1 ? '' : 's'}` : ''
        }.`}
      />

      {/* Service Tab Bar */}
      {services.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {services.map((svc) => (
            <button
              key={svc.name}
              onClick={() => setSelectedSvc(svc.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedSvc === svc.name
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]'
                  : 'bg-[#1a1a28] border-[#2a2a3d] text-[#94a3b8] hover:border-[#4a4a6a] hover:text-[#f1f5f9]'
              }`}
            >
              <Server size={11} />
              {svc.name}
            </button>
          ))}
        </div>
      )}

      {/* Service Detail Card */}
      {currentService && (
        <Panel padded={false} className="overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-[#2a2a3d] flex flex-col gap-3">
            <PanelHeader
              icon={Server}
              tone="#3b82f6"
              title={currentService.name}
              description={currentService.responsibility}
              actions={
                currentService.technology && (
                  <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30">
                    {currentService.technology}
                  </span>
                )
              }
            />

            {/* Dependencies */}
            {currentService.dependencies?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Overline>Depends on</Overline>
                {currentService.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[#1a1a28] border border-[#2a2a3d] text-[#94a3b8]"
                  >
                    <ArrowRight size={10} className="text-[#64748b]" />
                    {dep}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Endpoints */}
          <div className="p-5 flex flex-col gap-4">
            <PanelHeader
              icon={Tag}
              tone="#3b82f6"
              title={`Endpoints (${currentService.endpoints?.length || 0})`}
            />
            <div className="space-y-2">
              {currentService.endpoints?.map((ep, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[#1a1a28] border border-[#2a2a3d] rounded-xl px-4 py-3 hover:border-[#3b82f6]/30 transition-colors"
                >
                  <MethodBadge method={ep.method} />
                  <div className="flex-1 min-w-0">
                    <code className="text-sm text-[#e2e8f0] font-mono">
                      {ep.path}
                    </code>
                    {ep.description && (
                      <p className="text-xs text-[#94a3b8] mt-0.5">{ep.description}</p>
                    )}
                  </div>
                  {ep.auth && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#422006] text-[#fbbf24] border border-[#d97706]/30">
                      AUTH
                    </span>
                  )}
                </div>
              ))}
              {(!currentService.endpoints || currentService.endpoints.length === 0) && (
                <p className="text-sm text-[#94a3b8] py-2">No endpoints defined</p>
              )}
            </div>
          </div>
        </Panel>
      )}

      {/* Service Dependency Diagram */}
      {services.length > 1 && (
        <div className="relative rounded-xl overflow-hidden border border-[#2a2a3d] bg-[#0a0a0f]" style={{ height: 300 }}>
          <div className="absolute z-10 m-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30">
              Service Dependencies
            </span>
          </div>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={lldNodeTypes}
            colorMode="dark"
            minZoom={0.05}
            maxZoom={4}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: '#0a0a0f' }}
          >
            <Background variant={BackgroundVariant.Dots} color="#1e1e2e" gap={20} size={1} />
            <Controls
              style={{ background: '#12121a', border: '1px solid #2a2a3d', borderRadius: 8 }}
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      )}

      {/* Class Design Section */}
      {design.lld?.classes?.length > 0 && (
        <Panel className="flex flex-col gap-4">
          <PanelHeader
            icon={Cpu}
            tone="#8b5cf6"
            title="Class Design & Interface Contracts"
            description="Class members, method signatures and their interactions."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.lld.classes.map((cls, idx) => (
              <div key={idx} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-[#8b5cf6]/30 transition-colors">
                <div className="flex items-center justify-between mb-3 border-b border-[#2a2a3d] pb-2">
                  <span className="text-sm font-bold font-mono text-[#8b5cf6]">{cls.name}</span>
                  <span className="text-[11px] bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/25 px-2 py-0.5 rounded font-mono font-bold">CLASS</span>
                </div>
                <div className="space-y-2">
                  {cls.methods?.map((m, mIdx) => (
                    <div key={mIdx} className="bg-[#12121a] p-2.5 rounded-lg border border-[#2a2a3d]/50">
                      <div className="flex items-start justify-between gap-2">
                        <code className="text-xs font-mono text-[#e2e8f0] font-semibold break-all">
                          {m.name}({m.parameters?.join(', ') || ''})
                        </code>
                        <span className="text-[11px] font-mono text-blue-400 flex-shrink-0 font-bold">
                          → {m.returnType || 'void'}
                        </span>
                      </div>
                      {m.description && <p className="text-[12px] text-[#94a3b8] mt-1 leading-relaxed">{m.description}</p>}
                    </div>
                  ))}
                  {cls.interactions?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#2a2a3d]/30">
                      <Overline>Interactions</Overline>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {cls.interactions.map((inter, i) => (
                          <li key={i} className="text-xs text-[#94a3b8] font-sans leading-relaxed">{inter}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Class Diagram & Execution Logic */}
      {(design.lld?.classDiagram || design.lld?.logic) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {design.lld.classDiagram && (
            <Panel className="flex flex-col gap-4 min-h-[300px]">
              <PanelHeader
                icon={Network}
                tone="#3b82f6"
                title="Class Relationships & Diagrams"
              />
              <pre className="flex-1 bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-4 text-xs font-mono text-[#e2e8f0] overflow-auto whitespace-pre-wrap leading-relaxed">
                {design.lld.classDiagram}
              </pre>
            </Panel>
          )}
          {design.lld.logic && (
            <Panel className="flex flex-col gap-4 min-h-[300px]">
              <PanelHeader
                icon={Activity}
                tone="#06b6d4"
                title="Logic Flow & Execution Sequence"
              />
              <div className="flex-1 bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-4 text-xs text-[#94a3b8] overflow-auto leading-relaxed whitespace-pre-line">
                {design.lld.logic}
              </div>
            </Panel>
          )}
        </div>
      )}
    </TabShell>
  )
}
