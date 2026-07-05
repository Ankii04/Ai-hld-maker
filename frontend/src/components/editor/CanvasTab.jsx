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
      const nextEds = addEdge(params, eds)
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

  const handleAddNode = useCallback((type, position) => {
    const newNode = {
      id: `canvas_${Date.now()}`,
      type: 'resizableShape',
      position,
      data: { label: 'New Shape', shape: type, color: '#1e293b' },
    }
    setNodes((nds) => {
      const nextNds = nds.concat(newNode)
      pushState(nextNds, edges)
      return nextNds
    })
  }, [edges, pushState, setNodes])

  return (
    <div id="canvas-tab" className="flex flex-col h-[700px] w-full bg-[#0a0a0f] relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={() => setMenu(null)}
        nodeTypes={CanvasNodes}
        snapToGrid={true}
        snapGrid={[20, 20]}
        fitView
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3d" />
        <Controls showInteractive={false} className="bg-[#12121a] border border-[#2a2a3d]" />
        
        <Panel position="top-center" className="bg-[#12121a] border border-[#2a2a3d] p-1.5 rounded-xl shadow-xl flex gap-2 items-center">
          <CanvasToolbar onAddNode={(type) => {
            const pos = reactFlowInstance?.screenToFlowPosition({ x: 300, y: 200 }) || { x: 100, y: 100 }
            handleAddNode(type, pos)
          }} />
          <div className="w-px h-6 bg-[#2a2a3d]" />
          <button onClick={undo} disabled={!canUndo} className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-30">
            <Undo size={16} />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-30">
            <Redo size={16} />
          </button>
        </Panel>

        {menu && (
          <ContextMenu
            onClick={() => setMenu(null)}
            {...menu}
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
