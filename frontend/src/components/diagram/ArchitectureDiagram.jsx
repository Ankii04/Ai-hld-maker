import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './CustomNodes'
import {
  Monitor,
  Globe,
  GitBranch,
  Shield,
  Server,
  Database,
  Zap,
  MessageSquare,
  X,
  Trash2,
  Save,
  LayoutGrid,
  Plus,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import dagre from 'dagre'

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 50 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 100 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - 50,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

/* ─── Node toolbox config ─────────────────────────────────────────────────── */
const TOOLBOX_ITEMS = [
  { type: 'client',   label: 'Client',    icon: Monitor,       color: '#475569', bg: '#1e293b' },
  { type: 'cdn',      label: 'CDN',       icon: Globe,         color: '#c2410c', bg: '#431407' },
  { type: 'lb',       label: 'LB',        icon: GitBranch,     color: '#d97706', bg: '#422006' },
  { type: 'gateway',  label: 'Gateway',   icon: Shield,        color: '#9333ea', bg: '#3b0764' },
  { type: 'service',  label: 'Service',   icon: Server,        color: '#3b82f6', bg: '#1e3a5f' },
  { type: 'database', label: 'DB',        icon: Database,      color: '#16a34a', bg: '#14532d' },
  { type: 'cache',    label: 'Cache',     icon: Zap,           color: '#dc2626', bg: '#450a0a' },
  { type: 'queue',    label: 'Queue',     icon: MessageSquare, color: '#ec4899', bg: '#500724' },
]

const DEFAULT_LABELS = {
  client: 'New Client',
  cdn: 'New CDN',
  lb: 'Load Balancer',
  gateway: 'API Gateway',
  service: 'New Service',
  database: 'New Database',
  cache: 'New Cache',
  queue: 'New Queue',
}

/* ─── Convert API node data → React Flow format ──────────────────────────── */
function convertApiNodes(apiNodes = []) {
  return apiNodes.map((n) => ({
    id: n.id,
    type: n.type || 'service',
    position: n.position || { x: Math.random() * 600, y: Math.random() * 400 },
    targetPosition: n.targetPosition || 'top',
    sourcePosition: n.sourcePosition || 'bottom',
    data: {
      label: n.label || n.name || 'Node',
      description: n.description || '',
      technology: n.technology || '',
    },
  }))
}

function convertApiEdges(apiEdges = []) {
  return apiEdges.map((e) => ({
    id: e.id || `edge-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    label: e.label || '',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    style: { stroke: '#3b82f6', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#12121a', fillOpacity: 0.85 },
  }))
}

let nodeIdCounter = 1000

/* ─── Node Editing Drawer ────────────────────────────────────────────────── */
function NodeEditDrawer({ node, onClose, onSave, onDelete }) {
  const [label, setLabel] = useState(node?.data?.label || '')
  const [description, setDescription] = useState(node?.data?.description || '')
  const [technology, setTechnology] = useState(node?.data?.technology || '')
  const [type, setType] = useState(node?.type || 'service')

  useEffect(() => {
    if (node) {
      setLabel(node.data?.label || '')
      setDescription(node.data?.description || '')
      setTechnology(node.data?.technology || '')
      setType(node.type || 'service')
    }
  }, [node?.id])

  const handleSave = () => {
    onSave({ label, description, technology, type })
  }

  return (
    <div className="absolute top-0 right-0 h-full w-72 bg-[#12121a] border-l border-[#2a2a3d] z-50 flex flex-col shadow-2xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a3d]">
        <h3 className="text-sm font-semibold text-[#f1f5f9]">Edit Node</h3>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#2a2a3d] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div>
          <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Label
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#4a4a6a] focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Node Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-colors"
          >
            {TOOLBOX_ITEMS.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#4a4a6a] focus:outline-none focus:border-[#3b82f6] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Technology
          </label>
          <input
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            placeholder="e.g. Redis, PostgreSQL"
            className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#4a4a6a] focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-[#2a2a3d] space-y-2">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white hover:opacity-90 transition-opacity"
        >
          <Save size={14} />
          Save Changes
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold bg-[#450a0a] border border-[#dc2626]/40 text-[#f87171] hover:bg-[#dc2626]/20 transition-colors"
        >
          <Trash2 size={14} />
          Delete Node
        </button>
      </div>
    </div>
  )
}

/* ─── ArchitectureDiagram ─────────────────────────────────────────────────── */
export default function ArchitectureDiagram({
  nodes: propNodes = [],
  edges: propEdges = [],
  onNodesChange: onNodesPropChange,
  onEdgesChange: onEdgesPropChange,
  readOnly = false,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(convertApiNodes(propNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertApiEdges(propEdges))
  const [selectedNode, setSelectedNode] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    if (!reactFlowWrapper.current) return
    const el = reactFlowWrapper.current
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch((err) => console.error(err))
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        )
      )
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 250 })
        }
      }, 150)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [reactFlowInstance])

  /* Sync prop changes into state with auto-layout check */
  useEffect(() => {
    const apiNodes = convertApiNodes(propNodes)
    const apiEdges = convertApiEdges(propEdges)
    
    // Auto-layout on initial generation if they are unpositioned
    const needsLayout = propNodes.length > 0 && propNodes.some(n => !n.position || (n.position.x === 0 && n.position.y === 0))
    if (needsLayout) {
      const { nodes: ln, edges: le } = getLayoutedElements(apiNodes, apiEdges, 'TB')
      setNodes(ln)
      setEdges(le)
      syncToParent(ln, le)
    } else {
      setNodes(apiNodes)
      setEdges(apiEdges)
    }
  }, [JSON.stringify(propNodes), JSON.stringify(propEdges)])

  /* Auto-fit view when new nodes are loaded (e.g. after AI generation) */
  useEffect(() => {
    if (reactFlowInstance && propNodes.length > 0) {
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 450 })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [propNodes.length, reactFlowInstance])

  /* Propagate changes back to parent in the proper API format */
  const syncToParent = useCallback((nextNodes, nextEdges) => {
    const apiNodes = nextNodes.map(n => ({
      id: n.id,
      type: n.type,
      label: n.data?.label || '',
      description: n.data?.description || '',
      technology: n.data?.technology || '',
      position: n.position,
      targetPosition: n.targetPosition || 'top',
      sourcePosition: n.sourcePosition || 'bottom'
    }))
    onNodesPropChange?.(apiNodes)

    if (nextEdges) {
      const apiEdges = nextEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        animated: e.animated ?? true
      }))
      onEdgesPropChange?.(apiEdges)
    }
  }, [onNodesPropChange, onEdgesPropChange])

  /* Local React Flow change handlers */
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes)
    },
    [onNodesChange]
  )

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes)
    },
    [onEdgesChange]
  )

  const onNodeDragStop = useCallback((_, node) => {
    syncToParent(nodes, edges)
  }, [nodes, edges, syncToParent])

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        style: { stroke: '#3b82f6', strokeWidth: 1.5 },
      }
      setEdges((eds) => {
        const nextEds = addEdge(newEdge, eds)
        syncToParent(nodes, nextEds)
        return nextEds
      })
    },
    [nodes, setEdges, syncToParent]
  )

  const onNodeClick = useCallback((_, node) => {
    if (!readOnly) setSelectedNode(node)
  }, [readOnly])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  /* Add node from toolbox */
  const addNode = useCallback(
    (type) => {
      nodeIdCounter += 1
      const id = `node_${nodeIdCounter}`
      const center = reactFlowInstance
        ? reactFlowInstance.screenToFlowPosition({
            x: (reactFlowWrapper.current?.offsetWidth ?? 600) / 2,
            y: (reactFlowWrapper.current?.offsetHeight ?? 400) / 2,
          })
        : { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 }

      const newNode = {
        id,
        type,
        position: center,
        data: {
          label: DEFAULT_LABELS[type] || 'New Node',
          description: '',
          technology: '',
        },
      }
      setNodes((nds) => {
        const nextNds = [...nds, newNode]
        syncToParent(nextNds, edges)
        return nextNds
      })
    },
    [reactFlowInstance, edges, setNodes, syncToParent]
  )

  /* Save node edits */
  const handleSaveNodeEdit = useCallback(
    ({ label, description, technology, type: newType }) => {
      setNodes((nds) => {
        const nextNds = nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, type: newType, data: { ...n.data, label, description, technology } }
            : n
        )
        syncToParent(nextNds, edges)
        return nextNds
      })
      setSelectedNode(null)
    },
    [selectedNode, edges, setNodes, syncToParent]
  )

  /* Delete node */
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return
    setNodes((nds) => {
      const nextNds = nds.filter((n) => n.id !== selectedNode.id)
      setEdges((eds) => {
        const nextEds = eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
        syncToParent(nextNds, nextEds)
        return nextEds
      })
      return nextNds
    })
    setSelectedNode(null)
  }, [selectedNode, setNodes, setEdges, syncToParent])

  /* Intercept delete events from React Flow panel */
  const onNodesDelete = useCallback((deleted) => {
    setNodes((nds) => {
      const nextNds = nds.filter(n => !deleted.some(d => d.id === n.id))
      syncToParent(nextNds, edges)
      return nextNds
    })
  }, [edges, setNodes, syncToParent])

  const onEdgesDelete = useCallback((deleted) => {
    setEdges((eds) => {
      const nextEds = eds.filter(e => !deleted.some(d => d.id === e.id))
      syncToParent(nodes, nextEds)
      return nextEds
    })
  }, [nodes, setEdges, syncToParent])

  return (
    <div ref={reactFlowWrapper} className="relative w-full h-full bg-[#0a0a0f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        colorMode="dark"
        minZoom={0.05}
        maxZoom={4}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0a0f' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e1e2e"
          gap={20}
          size={1.2}
        />
        <Controls
          style={{
            background: '#12121a',
            border: '1px solid #2a2a3d',
            borderRadius: 8,
            overflow: 'hidden',
          }}
          showInteractive={false}
        />
        <MiniMap
          style={{
            background: '#12121a',
            border: '1px solid #2a2a3d',
            borderRadius: 8,
          }}
          nodeColor={(n) => {
            const colors = {
              client: '#475569', cdn: '#c2410c', lb: '#d97706', gateway: '#9333ea',
              service: '#3b82f6', database: '#16a34a', cache: '#dc2626', queue: '#ec4899',
            }
            return colors[n.type] || '#3b82f6'
          }}
          maskColor="rgba(10,10,15,0.7)"
        />

        {/* Toolbox Panel */}
        {!readOnly && (
          <Panel position="top-right">
            <div className="flex items-center gap-1.5 bg-[#12121a] border border-[#2a2a3d] rounded-xl p-2 shadow-2xl backdrop-blur-md">
              {/* Layout Button */}
              <button
                onClick={() => {
                  const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges, 'TB')
                  setNodes(ln)
                  setEdges(le)
                  syncToParent(ln, le)
                  setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2, duration: 300 }), 50)
                }}
                title="Auto-arrange graph (Dagre)"
                className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 active:scale-95 transition-all min-w-[44px]"
              >
                <LayoutGrid size={14} />
                <span className="text-[9px] font-semibold leading-none">Layout</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 active:scale-95 transition-all min-w-[44px]"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span className="text-[9px] font-semibold leading-none">
                  {isFullscreen ? 'Exit' : 'Full'}
                </span>
              </button>
              
              <div className="w-px h-6 bg-[#2a2a3d]" />

              {/* Expanded Node Toolbar */}
              {isOpen && (
                <div className="flex items-center gap-1.5 transition-all duration-300">
                  {TOOLBOX_ITEMS.map(({ type, label, icon: Icon, color, bg }) => (
                    <button
                      key={type}
                      onClick={() => addNode(type)}
                      title={`Add ${label}`}
                      className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg hover:opacity-90 active:scale-[0.95] transition-all min-w-[44px] group"
                      style={{ background: bg, border: `1px solid ${color}40` }}
                    >
                      <Icon size={14} style={{ color }} />
                      <span
                        className="text-[9px] font-semibold leading-none"
                        style={{ color }}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                  <div className="w-px h-6 bg-[#2a2a3d]" />
                </div>
              )}

              {/* Add Node Toggle Button */}
              <button
                onClick={() => setIsOpen((v) => !v)}
                className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg transition-all min-w-[56px] ${
                  isOpen
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                }`}
              >
                {isOpen ? <X size={14} /> : <Plus size={14} />}
                <span className="text-[9px] font-bold leading-none">
                  {isOpen ? 'Close' : 'Add Node'}
                </span>
              </button>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Node editing drawer */}
      {selectedNode && !readOnly && (
        <NodeEditDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={handleSaveNodeEdit}
          onDelete={handleDeleteNode}
        />
      )}
    </div>
  )
}
