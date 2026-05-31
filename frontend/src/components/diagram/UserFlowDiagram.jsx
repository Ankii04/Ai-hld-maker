import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ChevronDown } from 'lucide-react'
import dagre from 'dagre'

/* ─── Screen node types ─────────────────────────────────────────────────── */
function ScreenNode({ data, selected }) {
  const getBorderColor = () => {
    switch (data?.screenType) {
      case 'entry': return '#16a34a'
      case 'exit': return '#475569'
      default: return '#3b82f6'
    }
  }
  const getBackground = () => {
    switch (data?.screenType) {
      case 'entry': return '#0d1a12'
      case 'exit': return '#131316'
      default: return '#0d1220'
    }
  }

  const borderColor = getBorderColor()

  return (
    <div
      className="relative px-4 py-3 rounded-xl text-center min-w-[120px] max-w-[180px] transition-all duration-200"
      style={{
        background: getBackground(),
        border: `1.5px solid ${selected ? borderColor : borderColor + '88'}`,
        boxShadow: selected
          ? `0 0 0 2px ${borderColor}30, 0 4px 20px ${borderColor}20`
          : '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Target handle on Left */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: borderColor,
          border: '1.5px solid #0d1220',
          width: 8,
          height: 8,
        }}
      />

      {data?.screenType === 'entry' && (
        <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#16a34a22] text-[#4ade80] border border-[#16a34a44]">
          Entry
        </span>
      )}
      {data?.screenType === 'exit' && (
        <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#1e293b] text-[#64748b] border border-[#47556933]">
          Exit
        </span>
      )}
      <p className="text-[#f1f5f9] text-xs font-semibold leading-snug">
        {data?.label || 'Screen'}
      </p>
      {data?.description && (
        <p className="text-[#94a3b8] text-[10px] mt-1 leading-snug">
          {data.description}
        </p>
      )}

      {/* Source handle on Right */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: borderColor,
          border: '1.5px solid #0d1220',
          width: 8,
          height: 8,
        }}
      />
    </div>
  )
}

const screenNodeTypes = { screen: ScreenNode }

/* ─── Convert userFlows data → React Flow ────────────────────────────────── */
function convertFlowToGraph(flow) {
  if (!flow?.steps) return { nodes: [], edges: [] }

  const screenMap = {}
  const nodes = []
  const edges = []

  // Gather unique screens
  flow.steps.forEach((step) => {
    if (!screenMap[step.screen]) {
      screenMap[step.screen] = {
        id: `screen_${step.screen.replace(/\s+/g, '_')}`,
      }
    }
    if (step.next && !screenMap[step.next]) {
      screenMap[step.next] = {
        id: `screen_${step.next.replace(/\s+/g, '_')}`,
      }
    }
  })

  // Build nodes
  const screenKeys = Object.keys(screenMap)
  screenKeys.forEach((screenName, idx) => {
    const isEntry = idx === 0
    const isExit = idx === screenKeys.length - 1
    nodes.push({
      id: screenMap[screenName].id,
      type: 'screen',
      position: { x: 0, y: 0 },
      targetPosition: 'left',
      sourcePosition: 'right',
      data: {
        label: screenName,
        screenType: isEntry ? 'entry' : isExit ? 'exit' : 'core',
      },
    })
  })

  // Build edges
  flow.steps.forEach((step, idx) => {
    if (step.next && screenMap[step.screen] && screenMap[step.next]) {
      edges.push({
        id: `edge_${idx}`,
        source: screenMap[step.screen].id,
        target: screenMap[step.next].id,
        type: 'smoothstep',
        label: step.action || '',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        style: { stroke: '#3b82f6', strokeWidth: 1.5 },
        labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#12121a', fillOpacity: 0.9 },
        labelBgPadding: [4, 6],
      })
    }
  })

  // Apply Dagre auto-layout LR to screen nodes
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 120, ranksep: 180 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 80 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const pos = dagreGraph.node(node.id)
    node.position = {
      x: pos.x - 80,
      y: pos.y - 40,
    }
  })

  return { nodes, edges }
}

/* ─── UserFlowDiagram ─────────────────────────────────────────────────────── */
export default function UserFlowDiagram({
  userFlows = [],
  selectedFlow: selectedFlowProp,
  onFlowChange,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const currentFlow = userFlows[selectedIndex] || null

  useEffect(() => {
    if (currentFlow) {
      const { nodes: n, edges: e } = convertFlowToGraph(currentFlow)
      setNodes(n)
      setEdges(e)
    }
  }, [selectedIndex, userFlows])

  const handleSelectFlow = (idx) => {
    setSelectedIndex(idx)
    setDropdownOpen(false)
    onFlowChange?.(userFlows[idx])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Flow selector */}
      {userFlows.length > 1 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Flow:
          </span>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-1.5 text-sm text-[#f1f5f9] hover:border-[#3b82f6]/60 transition-colors"
            >
              <span>{currentFlow?.name || `Flow ${selectedIndex + 1}`}</span>
              <ChevronDown
                size={13}
                className={`text-[#94a3b8] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute z-20 top-full left-0 mt-1 bg-[#1a1a28] border border-[#2a2a3d] rounded-lg overflow-hidden shadow-xl min-w-[160px]">
                {userFlows.map((flow, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectFlow(idx)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      idx === selectedIndex
                        ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                        : 'text-[#94a3b8] hover:bg-[#2a2a3d] hover:text-[#f1f5f9]'
                    }`}
                  >
                    {flow.name || `Flow ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        {[
          { color: '#16a34a', label: 'Entry Screen' },
          { color: '#3b82f6', label: 'Core Screen' },
          { color: '#475569', label: 'Exit Screen' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm border"
              style={{ borderColor: color, background: color + '22' }}
            />
            <span className="text-[10px] text-[#94a3b8]">{label}</span>
          </div>
        ))}
      </div>

      {/* Diagram */}
      <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-[#2a2a3d]">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={screenNodeTypes}
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
              style={{
                background: '#12121a',
                border: '1px solid #2a2a3d',
                borderRadius: 8,
              }}
              showInteractive={false}
            />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-[#4a4a6a] text-sm">
            No user flow data available
          </div>
        )}
      </div>
    </div>
  )
}
