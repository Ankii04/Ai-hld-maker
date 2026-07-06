import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CanvasNodes } from '../diagram/CanvasNodes'
import CanvasToolbar from '../diagram/CanvasToolbar'
import ContextMenu from '../diagram/ContextMenu'
import CanvasProperties from '../diagram/CanvasProperties'
import IconSearchPanel from '../diagram/IconSearchPanel'
import { Undo, Redo } from 'lucide-react'

function useHistory(initialNodes, initialEdges) {
  const [history, setHistory] = useState([{ nodes: initialNodes, edges: initialEdges }])
  const [pointer, setPointer] = useState(0)

  const pushState = useCallback((nodes, edges) => {
    setHistory((prev) => {
      const next = prev.slice(0, pointer + 1)
      next.push({ nodes, edges })
      if (next.length > 50) next.shift()
      return next
    })
    setPointer((prev) => Math.min(prev + 1, 49))
  }, [pointer])

  const undo = useCallback(() => {
    if (pointer > 0) setPointer(pointer - 1)
  }, [pointer])

  const redo = useCallback(() => {
    if (pointer < history.length - 1) setPointer(pointer + 1)
  }, [pointer, history.length])

  return {
    state: history[pointer] || { nodes: [], edges: [] },
    pushState,
    undo,
    redo,
    canUndo: pointer > 0,
    canRedo: pointer < history.length - 1,
  }
}

export default function CanvasTab({ design }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory([], [])
  
  const [nodes, setNodes, onNodesChangeCore] = useNodesState(state.nodes)
  const [edges, setEdges, onEdgesChangeCore] = useEdgesState(state.edges)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [menu, setMenu] = useState(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState(null)
  const [showIconSearch, setShowIconSearch] = useState(false)
  const reactFlowWrapper = useRef(null)

  useEffect(() => {
    setNodes(state.nodes)
    setEdges(state.edges)
  }, [state, setNodes, setEdges])

  const onNodesChange = useCallback((changes) => {
    onNodesChangeCore(changes)
  }, [onNodesChangeCore])

  const onEdgesChange = useCallback((changes) => {
    onEdgesChangeCore(changes)
  }, [onEdgesChangeCore])

  const onNodeDragStop = useCallback(() => {
    pushState(nodes, edges)
  }, [nodes, edges, pushState])

  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const nextEds = addEdge({ ...params, type: 'default', animated: false }, eds)
      pushState(nodes, nextEds)
      return nextEds
    })
  }, [nodes, pushState, setEdges])

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault()
    const bounds = reactFlowWrapper.current.getBoundingClientRect()
    setMenu({ id: 'pane', top: event.clientY - bounds.top, left: event.clientX - bounds.left })
  }, [])

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    const bounds = reactFlowWrapper.current.getBoundingClientRect()
    setMenu({ id: node.id, top: event.clientY - bounds.top, left: event.clientX - bounds.left, node })
  }, [])

  const handleAddNode = useCallback((type, position, iconProps = null) => {
    let newNode = {
      id: `canvas_${Date.now()}`,
      type: 'resizableShape',
      position,
      data: { shape: type, color: type === 'text' ? 'transparent' : '#1e293b', label: type === 'text' ? 'Text' : 'New Shape' },
    }

    if (iconProps) {
      newNode = {
        id: `canvas_${Date.now()}`,
        type: 'iconNode',
        position,
        data: { iconName: iconProps.iconName, label: iconProps.label, color: '#f1f5f9' },
      }
    }

    setNodes((nds) => {
      const nextNds = nds.concat(newNode)
      pushState(nextNds, edges)
      return nextNds
    })
  }, [edges, pushState, setNodes])

  const handleDuplicate = useCallback(() => {
    if (!menu?.node) return
    const newNode = {
      ...menu.node,
      id: `canvas_${Date.now()}`,
      position: { x: menu.node.position.x + 30, y: menu.node.position.y + 30 },
      selected: true
    }
    setNodes((nds) => {
      const nextNds = nds.map(n => ({ ...n, selected: false })).concat(newNode)
      pushState(nextNds, edges)
      return nextNds
    })
    setMenu(null)
  }, [menu, edges, pushState, setNodes])

  const handleZIndex = useCallback((direction) => {
    if (!menu?.node) return
    setNodes((nds) => {
      const target = nds.find(n => n.id === menu.node.id)
      if (!target) return nds
      const currentZ = target.zIndex || 0
      const nextNds = nds.map(n => n.id === target.id ? { ...n, zIndex: currentZ + direction } : n)
      pushState(nextNds, edges)
      return nextNds
    })
    setMenu(null)
  }, [menu, edges, pushState, setNodes])

  const onUpdateNode = useCallback((id, updates) => {
    setNodes(nds => {
      const nextNds = nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n)
      pushState(nextNds, edges)
      return nextNds
    })
  }, [edges, pushState, setNodes])

  const onUpdateEdge = useCallback((id, updates) => {
    setEdges(eds => {
      const nextEds = eds.map(e => e.id === id ? { ...e, ...updates, style: { ...e.style, ...updates } } : e)
      pushState(nodes, nextEds)
      return nextEds
    })
  }, [nodes, pushState, setEdges])

  const onSelectionChange = useCallback(({ nodes: selNodes, edges: selEdges }) => {
    if (selNodes.length === 1) setSelectedNodeId(selNodes[0].id)
    else setSelectedNodeId(null)
    
    if (selEdges.length === 1) setSelectedEdgeId(selEdges[0].id)
    else setSelectedEdgeId(null)
  }, [])

  return (
    <div id="canvas-tab" className="flex flex-col h-[700px] w-full bg-[#0a0a0f] relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onInit={setReactFlowInstance}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={() => {
          setMenu(null)
          setShowIconSearch(false)
        }}
        nodeTypes={CanvasNodes}
        snapToGrid={true}
        snapGrid={[20, 20]}
        fitView
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3d" />
        <Controls showInteractive={false} className="bg-[#12121a] border border-[#2a2a3d]" />
        
        {/* Undo/Redo at top-right */}
        <Panel position="top-right" className="bg-[#12121a] border border-[#2a2a3d] p-1.5 rounded-xl shadow-xl flex gap-1 items-center mt-2 mr-2">
          <button onClick={undo} disabled={!canUndo} className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-30 transition-colors">
            <Undo size={16} />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-30 transition-colors">
            <Redo size={16} />
          </button>
        </Panel>

        {/* Vertical Toolbar at left-center */}
        <Panel position="top-left" className="mt-4 ml-2">
          <CanvasToolbar 
            onAddNode={(type) => {
              const pos = reactFlowInstance?.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) || { x: 100, y: 100 }
              handleAddNode(type, pos)
            }} 
            onToggleSearch={() => setShowIconSearch(prev => !prev)}
          />
        </Panel>

        {showIconSearch && (
          <IconSearchPanel 
            onClose={() => setShowIconSearch(false)}
            onSelect={(iconProps) => {
              const pos = reactFlowInstance?.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) || { x: 100, y: 100 }
              handleAddNode(null, pos, iconProps)
            }}
          />
        )}

        <CanvasProperties
          selectedNode={nodes.find(n => n.id === selectedNodeId)}
          selectedEdge={edges.find(e => e.id === selectedEdgeId)}
          onUpdateNode={onUpdateNode}
          onUpdateEdge={onUpdateEdge}
        />

        {menu && (
          <ContextMenu
            onClick={() => setMenu(null)}
            {...menu}
            onDuplicate={handleDuplicate}
            onBringToFront={() => handleZIndex(1)}
            onSendToBack={() => handleZIndex(-1)}
            onDelete={() => {
              if (menu.id !== 'pane') {
                setNodes((nds) => {
                  const nextNds = nds.filter((n) => n.id !== menu.id)
                  pushState(nextNds, edges)
                  return nextNds
                })
              }
              setMenu(null)
            }}
          />
        )}
      </ReactFlow>
    </div>
  )
}
