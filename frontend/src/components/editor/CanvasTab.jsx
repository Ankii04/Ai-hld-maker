import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
import useDesignStore from '../../store/designStore'
import { Undo, Redo, Check, Loader2 } from 'lucide-react'

/**
 * Ref-backed undo/redo history. Deliberately avoids splitting the stack
 * pointer and the stack array across two separate useState calls — doing so
 * let the pointer and array desync once the 50-entry cap kicked in (trimming
 * the front of the array without adjusting the pointer). Everything here
 * lives on one ref and a cheap re-render trigger.
 */
function useHistory(initialNodes, initialEdges) {
  const ref = useRef({ stack: [{ nodes: initialNodes, edges: initialEdges }], pointer: 0 })
  const [, bump] = useState(0)

  const pushState = useCallback((nodes, edges) => {
    const h = ref.current
    const truncated = h.stack.slice(0, h.pointer + 1)
    truncated.push({ nodes, edges })
    const overflow = truncated.length - 50
    h.stack = overflow > 0 ? truncated.slice(overflow) : truncated
    h.pointer = h.stack.length - 1
    bump((x) => x + 1)
  }, [])

  const undo = useCallback(() => {
    const h = ref.current
    if (h.pointer > 0) {
      h.pointer -= 1
      bump((x) => x + 1)
    }
  }, [])

  const redo = useCallback(() => {
    const h = ref.current
    if (h.pointer < h.stack.length - 1) {
      h.pointer += 1
      bump((x) => x + 1)
    }
  }, [])

  const h = ref.current
  return {
    state: h.stack[h.pointer] || { nodes: [], edges: [] },
    pushState,
    undo,
    redo,
    canUndo: h.pointer > 0,
    canRedo: h.pointer < h.stack.length - 1,
  }
}

const isTypingTarget = (el) =>
  !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

export default function CanvasTab({ design }) {
  const designId = design?._id || design?.id
  const savedCanvas = design?.canvas

  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(
    savedCanvas?.nodes || [],
    savedCanvas?.edges || []
  )

  const [nodes, setNodes, onNodesChangeCore] = useNodesState(state.nodes)
  const [edges, setEdges, onEdgesChangeCore] = useEdgesState(state.edges)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [menu, setMenu] = useState(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState(null)
  const [showIconSearch, setShowIconSearch] = useState(false)
  const [saveState, setSaveState] = useState(savedCanvas ? 'saved' : 'idle') // idle | saving | saved
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

  /* ── Delete whatever is currently selected (multi-select aware) ────────── */
  const deleteSelected = useCallback(() => {
    setNodes((nds) => {
      const hadSelection = nds.some((n) => n.selected)
      const nextNds = nds.filter((n) => !n.selected)
      setEdges((eds) => {
        const nextEds = eds.filter((e) => !e.selected)
        if (hadSelection || eds.some((e) => e.selected)) {
          pushState(nextNds, nextEds)
        }
        return nextEds
      })
      return nextNds
    })
  }, [pushState, setNodes, setEdges])

  /* ── Duplicate whatever is currently selected ───────────────────────────── */
  const duplicateSelected = useCallback(() => {
    setNodes((nds) => {
      const selected = nds.filter((n) => n.selected)
      if (selected.length === 0) return nds
      const clones = selected.map((n) => ({
        ...n,
        id: `canvas_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        position: { x: n.position.x + 30, y: n.position.y + 30 },
        selected: true,
      }))
      const nextNds = nds.map((n) => ({ ...n, selected: false })).concat(clones)
      pushState(nextNds, edges)
      return nextNds
    })
  }, [edges, pushState, setNodes])

  /* ── Keyboard shortcuts: Delete, Ctrl+Z/Y, Ctrl+D, Escape ───────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (isTypingTarget(document.activeElement)) return
      const mod = e.ctrlKey || e.metaKey

      if ((e.key === 'Delete' || e.key === 'Backspace') && !mod) {
        e.preventDefault()
        deleteSelected()
      } else if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicateSelected()
      } else if (e.key === 'Escape') {
        setMenu(null)
        setShowIconSearch(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [deleteSelected, undo, redo, duplicateSelected])

  /* ── Persistence: debounced autosave + flush-on-unmount (tab switch) ────
   * The Canvas tab component is unmounted whenever the user switches to a
   * different editor tab (Editor.jsx only renders the active tab). Without
   * this, every shape/edge drawn here was silently lost the moment you left
   * the tab. We now save to the design document on every change (debounced)
   * and flush immediately when the tab unmounts, so work always survives. */
  const latestRef = useRef({ nodes, edges })
  useEffect(() => {
    latestRef.current = { nodes, edges }
  }, [nodes, edges])

  useEffect(() => {
    if (!designId) return
    setSaveState('saving')
    const timeout = setTimeout(() => {
      useDesignStore.getState().saveCanvas(designId, { nodes, edges }).then((res) => {
        setSaveState(res.success ? 'saved' : 'idle')
      })
    }, 800)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, designId])

  useEffect(() => {
    return () => {
      if (designId) {
        useDesignStore.getState().saveCanvas(designId, latestRef.current)
      }
    }
  }, [designId])

  /* ── Inject a rename callback into node data (label editing) ────────────── */
  const nodesWithHandlers = useMemo(
    () => nodes.map((n) => ({
      ...n,
      data: { ...n.data, onRename: (label) => onUpdateNode(n.id, { label }) },
    })),
    [nodes, onUpdateNode]
  )

  return (
    <div id="canvas-tab" className="flex flex-col h-[700px] w-full bg-[#0a0a0f] relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodesWithHandlers}
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
        deleteKeyCode={null}
        snapToGrid={true}
        snapGrid={[20, 20]}
        fitView
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3d" />
        <Controls showInteractive={false} className="bg-[#12121a] border border-[#2a2a3d]" />

        {/* Undo/Redo + save status at top-right */}
        <Panel position="top-right" className="bg-[#12121a] border border-[#2a2a3d] p-1.5 rounded-xl shadow-xl flex gap-1 items-center mt-2 mr-2">
          <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-30 transition-colors">
            <Undo size={16} />
          </button>
          <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-30 transition-colors">
            <Redo size={16} />
          </button>
          <div className="w-px h-5 bg-[#2a2a3d] mx-1" />
          <div className="flex items-center gap-1 px-1 text-[11px] font-medium text-[#94a3b8]" title="Autosaves 800ms after your last change">
            {saveState === 'saving' ? (
              <>
                <Loader2 size={11} className="animate-spin" />
                Saving…
              </>
            ) : saveState === 'saved' ? (
              <>
                <Check size={11} className="text-green-400" />
                Saved
              </>
            ) : null}
          </div>
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
