import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { sandboxNodeTypes } from '../diagram/SandboxNodes'
import SimulationEdge from '../diagram/SimulationEdge'
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  AlertOctagon,
  VolumeX,
  Plus,
  Minus,
  Activity,
  ShieldAlert,
  Terminal,
  TrendingUp,
  Server,
  DollarSign,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'

// Default capacities and latencies for different node types
const CAPACITIES = {
  client:   { max: 100000, latency: 15,   err: 0.001 },
  cdn:      { max: 100000, latency: 5,    err: 0.001, cacheHitRate: 0.85 },
  lb:       { max: 50000,  latency: 2,    err: 0.01 },
  gateway:  { max: 25000,  latency: 5,    err: 0.02 },
  service:  { max: 3000,   latency: 20,   err: 0.1 },
  database: { max: 1500,   latency: 15,   err: 0.5 },
  cache:    { max: 75000,  latency: 1.5,  err: 0.01, cacheHitRate: 0.80 },
  queue:    { max: 15000,  latency: 4,    err: 0.05 },
}

// Convert blueprint nodes to React Flow sandbox nodes
function convertToSandboxNodes(apiNodes = []) {
  return apiNodes.map((n) => ({
    id: n.id,
    type: n.type || 'service',
    position: n.position || { x: Math.random() * 400, y: Math.random() * 300 },
    targetPosition: n.targetPosition || 'top',
    sourcePosition: n.sourcePosition || 'bottom',
    data: {
      label: n.label || n.name || 'Node',
      description: n.description || '',
      technology: n.technology || '',
      telemetry: {
        utilization: 0,
        latency: CAPACITIES[n.type]?.latency || 10,
        errorRate: 0,
        isOffline: false,
        activeInstances: 1,
        status: 'normal',
      },
    },
  }))
}

// Convert blueprint edges to React Flow simulation edges
function convertToSimulationEdges(apiEdges = []) {
  return apiEdges.map((e) => ({
    id: e.id || `edge-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    data: {
      state: 'idle',
      speed: 1,
      packetColor: '#3b82f6',
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    style: { stroke: '#2a2a3d', strokeWidth: 1.5 },
  }))
}

/* ─── Telemetry Sparkline Component (Pure SVG, zero deps) ─────────────────── */
function TelemetrySparkline({ data = [], color = '#3b82f6', maxVal = 100 }) {
  if (data.length < 2) return <div className="h-10 w-full bg-[#12121a]/30 rounded-lg animate-pulse" />

  const width = 300
  const height = 45
  const padding = 2

  // Map data to SVG coordinates
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - padding * 2) + padding
    // invert Y since SVG 0,0 is top-left
    const normalizedVal = maxVal > 0 ? val / maxVal : 0
    const y = height - (normalizedVal * (height - padding * 2) + padding)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
      {/* Glow path */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeOpacity={0.25}
        points={points}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      {/* Main path */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        points={points}
      />
    </svg>
  )
}

/* ─── SandboxTab Component ────────────────────────────────────────────────── */
export default function SandboxTab({ design }) {
  const blueprintNodes = design?.hld?.nodes || []
  const blueprintEdges = design?.hld?.edges || []

  // React Flow Node & Edge states
  const [nodes, setNodes, onNodesChange] = useNodesState(convertToSandboxNodes(blueprintNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertToSimulationEdges(blueprintEdges))
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  // Simulation Controls state
  const [isPlaying, setIsPlaying] = useState(false)
  const [targetRPS, setTargetRPS] = useState(100)
  const [currentRPS, setCurrentRPS] = useState(100)
  const [trafficPreset, setTrafficPreset] = useState('normal')

  // Chaos Engineering state
  const [chaosState, setChaosState] = useState({
    cacheOffline: false,
    gatewayDown: false,
    dbLatencySpike: false,
    killRandomService: false,
  })

  // Simulated metrics and telemetry histories for sparklines
  const [telemetry, setTelemetry] = useState({
    avgLatency: 15,
    globalErrorRate: 0,
    totalRequests: 0,
    estimatedCost: 15.5,
  })

  const [latencyHistory, setLatencyHistory] = useState([15, 15, 15, 15, 15])
  const [errorHistory, setErrorHistory] = useState([0, 0, 0, 0, 0])
  const [rpsHistory, setRpsHistory] = useState([100, 100, 100, 100, 100])

  // Logs Console state
  const [logs, setLogs] = useState([
    { type: 'info', text: '🧪 Load-testing sandbox ready. Toggle Play to start traffic.' },
  ])
  const consoleEndRef = useRef(null)

  // Service Instance scaling counts
  const [serviceInstances, setServiceInstances] = useState({})
  const [killedServiceId, setKilledServiceId] = useState(null)

  // Auto-scroll the terminal logs
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Add a line of log
  const addLog = useCallback((text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev.slice(-39), { type, text: `[${timestamp}] ${text}` }])
  }, [])

  // Traffic Preset selection
  useEffect(() => {
    if (trafficPreset === 'normal') {
      setTargetRPS(500)
      addLog('Traffic preset set to Normal (500 RPS).', 'info')
    } else if (trafficPreset === 'flash-sale') {
      setTargetRPS(15000)
      addLog('⚡ FLASH SALE SPIKE triggered! Injecting high traffic (15,000 RPS).', 'warning')
    } else if (trafficPreset === 'ddos') {
      setTargetRPS(80000)
      addLog('☠️ DDoS ATTACK initiated! flooding gateway with malicious traffic (80,000 RPS).', 'error')
    } else if (trafficPreset === 'ramp-up') {
      setTargetRPS(100)
      addLog('Gradual traffic ramp-up started.', 'info')
    }
  }, [trafficPreset, addLog])

  // Ramp-up interval
  useEffect(() => {
    if (!isPlaying || trafficPreset !== 'ramp-up') return

    const timer = setInterval(() => {
      setTargetRPS((prev) => {
        if (prev >= 25000) {
          setTrafficPreset('custom')
          addLog('Traffic ramp-up completed at max load.', 'info')
          return 25000
        }
        return prev + 1200
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, trafficPreset, addLog])

  // Reset all settings
  const handleReset = () => {
    setIsPlaying(false)
    setTargetRPS(100)
    setCurrentRPS(100)
    setTrafficPreset('normal')
    setChaosState({
      cacheOffline: false,
      gatewayDown: false,
      dbLatencySpike: false,
      killRandomService: false,
    })
    setKilledServiceId(null)
    setServiceInstances({})
    setNodes(convertToSandboxNodes(blueprintNodes))
    setEdges(convertToSimulationEdges(blueprintEdges))
    setTelemetry({
      avgLatency: 15,
      globalErrorRate: 0,
      totalRequests: 0,
      estimatedCost: 15.5,
    })
    setLatencyHistory([15, 15, 15, 15, 15])
    setErrorHistory([0, 0, 0, 0, 0])
    setRpsHistory([100, 100, 100, 100, 100])
    setLogs([{ type: 'info', text: '🧪 Simulation reset. Sandbox ready.' }])
  }

  // Handle Chaos state change
  const toggleChaos = (type) => {
    setChaosState((prev) => {
      const next = { ...prev, [type]: !prev[type] }
      
      // Handle logs for fault injection
      if (type === 'cacheOffline') {
        addLog(next.cacheOffline ? '💥 Chaos: Cache layer offline (Redis nodes flushed & killed)!' : '✅ Cache layer restored.', next.cacheOffline ? 'error' : 'success')
      } else if (type === 'gatewayDown') {
        addLog(next.gatewayDown ? '🚨 Chaos: API Gateway server killed! 100% network drop.' : '✅ API Gateway restarted.', next.gatewayDown ? 'error' : 'success')
      } else if (type === 'dbLatencySpike') {
        addLog(next.dbLatencySpike ? '⚠️ Chaos: Database replica replication lagged. Read locks active.' : '✅ Database locking cleared.', next.dbLatencySpike ? 'warning' : 'success')
      } else if (type === 'killRandomService') {
        if (next.killRandomService) {
          // find service nodes
          const sNodes = nodes.filter(n => n.type === 'service')
          if (sNodes.length > 0) {
            const randNode = sNodes[Math.floor(Math.random() * sNodes.length)]
            setKilledServiceId(randNode.id)
            addLog(`💥 Chaos: Killed active service instance: ${randNode.data?.label || randNode.id}!`, 'error')
          }
        } else {
          setKilledServiceId(null)
          addLog('✅ FAILED service instance recovered and booted.', 'success')
        }
      }
      return next
    })
  }

  // Math Simulation Engine Loop
  useEffect(() => {
    if (!isPlaying) {
      // Set edges to idle state when paused
      setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, state: 'idle' } })))
      return
    }

    const interval = setInterval(() => {
      // Smoothly slide current RPS towards target RPS
      const diff = targetRPS - currentRPS
      let step = Math.sign(diff) * Math.max(10, Math.min(Math.abs(diff) * 0.3, 3000))
      if (Math.abs(diff) < 10) step = diff
      const newCurrentRPS = Math.round(currentRPS + step)
      setCurrentRPS(newCurrentRPS)

      // ─── Mathematical Graph Traffic Propagation ───
      const flowRPS = {} // map of nodeId -> incoming RPS
      const nodeCapacity = {} // node capacity mapping

      // Initialize all nodes to 0 incoming RPS
      nodes.forEach(n => {
        flowRPS[n.id] = 0
        const capInfo = CAPACITIES[n.type] || { max: 2000, latency: 10 }
        nodeCapacity[n.id] = capInfo.max
      })

      // Identify Entry Nodes (nodes with no incoming edges or client nodes)
      const hasIncoming = new Set(edges.map(e => e.target))
      let entryNodes = nodes.filter(n => n.type === 'client')
      if (entryNodes.length === 0) {
        entryNodes = nodes.filter(n => !hasIncoming.has(n.id))
      }
      if (entryNodes.length === 0 && nodes.length > 0) {
        entryNodes = [nodes[0]]
      }

      // Feed initial traffic into entry nodes
      if (entryNodes.length > 0) {
        const splitRps = newCurrentRPS / entryNodes.length
        entryNodes.forEach(n => {
          flowRPS[n.id] = splitRps
        })
      }

      // Propagate traffic downstream iteratively
      // Standard DAG path propagation (5 iterations handles standard layered topologies)
      const activeEdges = {}
      for (let iter = 0; iter < 5; iter++) {
        edges.forEach(e => {
          const srcId = e.source
          const tgtId = e.target
          
          if (chaosState.gatewayDown && (srcId === 'gateway' || tgtId === 'gateway' || nodes.find(n => n.id === srcId)?.type === 'gateway' || nodes.find(n => n.id === tgtId)?.type === 'gateway')) {
            // Drop packets if gateway is down
            activeEdges[e.id] = { state: 'error', speed: 0, rps: 0 }
            return
          }

          // Check if source node is offline
          const srcNode = nodes.find(n => n.id === srcId)
          const tgtNode = nodes.find(n => n.id === tgtId)
          if (!srcNode || !tgtNode) return

          const isSrcOffline = srcNode.id === killedServiceId || (srcNode.type === 'gateway' && chaosState.gatewayDown)
          if (isSrcOffline) {
            activeEdges[e.id] = { state: 'dead', speed: 0, rps: 0 }
            return
          }

          // Calculate outgoing flow distribution
          // If LB, divide equally among healthy outgoing connections
          const outgoingEdges = edges.filter(ed => ed.source === srcId)
          const healthyOutgoing = outgoingEdges.filter(ed => ed.target !== killedServiceId)

          let distributedRPS = 0
          if (srcNode.type === 'lb') {
            const index = healthyOutgoing.findIndex(ed => ed.id === e.id)
            if (index !== -1) {
              distributedRPS = flowRPS[srcId] / healthyOutgoing.length
            }
          } else if (srcNode.type === 'cdn') {
            // CDN hit ratio: absorbs traffic. Cache hits don't propagate downstream.
            const hitRatio = chaosState.cacheOffline ? 0 : (CAPACITIES.cdn.cacheHitRate || 0.85)
            if (e.target === 'cache' || tgtNode.type === 'cache') {
              distributedRPS = flowRPS[srcId] * hitRatio
            } else {
              distributedRPS = flowRPS[srcId] * (1 - hitRatio)
            }
          } else if (srcNode.type === 'cache') {
            // Cache hits terminate here, misses propagate to DB/service
            const hitRatio = chaosState.cacheOffline ? 0 : (CAPACITIES.cache.cacheHitRate || 0.80)
            distributedRPS = flowRPS[srcId] * (1 - hitRatio)
          } else {
            // Standard split
            distributedRPS = flowRPS[srcId] / outgoingEdges.length
          }

          flowRPS[tgtId] += distributedRPS
          activeEdges[e.id] = {
            state: distributedRPS > 0 ? 'running' : 'idle',
            speed: Math.max(0.5, Math.min(3, distributedRPS / 2000)),
            rps: distributedRPS,
          }
        })
      }

      // Calculate node telemetry metrics
      let totalLatencySum = 0
      let totalNodesMeasured = 0
      let totalNodeErrors = 0
      let totalNodeIncoming = 0

      const updatedNodes = nodes.map((node) => {
        const type = node.type || 'service'
        const incoming = flowRPS[node.id] || 0
        const cap = CAPACITIES[type] || { max: 3000, latency: 15, err: 0.05 }

        let isNodeOffline = node.id === killedServiceId
        if (type === 'gateway' && chaosState.gatewayDown) isNodeOffline = true
        if (type === 'cache' && chaosState.cacheOffline) isNodeOffline = true

        // Read dynamic variables
        let activeInst = serviceInstances[node.id] || 1
        let maxCap = cap.max * activeInst
        
        // Auto-scaling logic (for services)
        if (type === 'service' && incoming > maxCap * 0.85 && activeInst < 4 && !isNodeOffline) {
          activeInst += 1
          setServiceInstances(prev => ({ ...prev, [node.id]: activeInst }))
          addLog(`📈 Auto-scaling: Scaled ${node.data?.label || node.id} to x${activeInst} instances due to high utilization.`, 'success')
        } else if (type === 'service' && incoming < maxCap * 0.3 && activeInst > 1 && !isNodeOffline) {
          activeInst -= 1
          setServiceInstances(prev => ({ ...prev, [node.id]: activeInst }))
          addLog(`📉 Auto-scaling: Scaled down ${node.data?.label || node.id} to x${activeInst} instances.`, 'info')
        }

        // Utilization calculation
        let util = isNodeOffline ? 0 : Math.min(100, (incoming / maxCap) * 100)
        
        // Latency calculation based on queue model
        let baseLat = cap.latency
        if (type === 'database' && chaosState.dbLatencySpike) {
          baseLat += 120 // heavy replication lag
        }
        
        let lat = baseLat
        if (util > 0) {
          // queueing formula delay: L = L0 + 1 / (mu - lambda)
          const excess = maxCap - incoming
          const queueDelay = excess > 0 ? (1000 / excess) : 2000
          lat = baseLat + Math.min(5000, queueDelay)
        }

        // Error Rate calculation
        let errRate = cap.err
        if (isNodeOffline) {
          errRate = 1.0 // 100% drop
        } else if (util > 95) {
          errRate = cap.err + (util - 95) / 10 // rate limiting / queue drop
        }

        // Set status
        let status = 'normal'
        if (isNodeOffline) status = 'offline'
        else if (util > 95 || errRate > 0.3) status = 'critical'
        else if (util > 75) status = 'warning'

        // Accumulate global statistics
        if (incoming > 0) {
          totalLatencySum += lat
          totalNodesMeasured += 1
          totalNodeErrors += incoming * errRate
          totalNodeIncoming += incoming
        }

        return {
          ...node,
          data: {
            ...node.data,
            telemetry: {
              utilization: util,
              latency: lat,
              errorRate: errRate,
              isOffline: isNodeOffline,
              activeInstances: activeInst,
              status,
            },
          },
        }
      })

      // Calculate global averages
      const avgLat = totalNodesMeasured > 0 ? totalLatencySum / totalNodesMeasured : 15
      const globalErr = totalNodeIncoming > 0 ? totalNodeErrors / totalNodeIncoming : 0
      
      // Update telemetry history
      setLatencyHistory((prev) => [...prev.slice(-19), avgLat])
      setErrorHistory((prev) => [...prev.slice(-19), globalErr])
      setRpsHistory((prev) => [...prev.slice(-19), newCurrentRPS])

      // Compute simulated cost: $0.05 per active instance per hour
      const totalInstances = updatedNodes.reduce((acc, curr) => acc + (curr.data?.telemetry?.activeInstances || 1), 0)
      const hourlyCost = totalInstances * 0.045 + (newCurrentRPS * 0.0005)

      setTelemetry((prev) => ({
        avgLatency: avgLat,
        globalErrorRate: globalErr,
        totalRequests: prev.totalRequests + Math.round(newCurrentRPS * 0.2), // requests per tick (200ms)
        estimatedCost: hourlyCost,
      }))

      // Update nodes state
      setNodes(updatedNodes)

      // Update edges state with visual telemetry
      setEdges((eds) =>
        eds.map((edge) => {
          const flowInfo = activeEdges[edge.id] || { state: 'idle', speed: 1, rps: 0 }
          
          // Decide packet glow color based on utilization/error
          let pColor = '#10b981' // green packets
          if (flowInfo.state === 'running' && flowInfo.rps > 2000) pColor = '#f59e0b' // high load
          if (flowInfo.state === 'error') pColor = '#ef4444' // broken

          return {
            ...edge,
            data: {
              state: flowInfo.state,
              speed: flowInfo.speed,
              packetColor: pColor,
            },
            style: {
              stroke:
                flowInfo.state === 'error'
                  ? '#ef4444'
                  : flowInfo.state === 'running'
                  ? pColor
                  : '#2a2a3d',
              strokeWidth: flowInfo.state === 'running' ? 2 : 1.5,
              transition: 'stroke 0.3s',
            },
          }
        })
      )

      // Random chaos notifications during simulation
      if (Math.random() < 0.05) {
        if (globalErr > 0.5) {
          addLog(`🚨 Critical system alert: SLA breached! Error rate is ${(globalErr * 100).toFixed(1)}%.`, 'error')
        } else if (avgLat > 300) {
          addLog(`⚠️ Performance alert: System latency crossed 300ms thresholds.`, 'warning')
        } else if (newCurrentRPS > 40000) {
          addLog(`🔥 Traffic scale warning: Ingress channels near max bandwidth boundaries.`, 'warning')
        }
      }
    }, 200)

    return () => clearInterval(interval)
  }, [isPlaying, targetRPS, currentRPS, nodes, edges, chaosState, killedServiceId, serviceInstances, addLog])

  return (
    <div id="sandbox-tab" className="relative flex flex-col md:flex-row h-[750px] bg-[#0a0a0f] border border-[#2a2a3d] rounded-2xl overflow-hidden">
      
      {/* ─── LEFT PANEL: Flow Whiteboard (70% width) ─── */}
      <div className="relative flex-1 h-full flex flex-col min-w-0">
        
        {/* Top Header Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30 shadow-lg backdrop-blur-md">
            <Activity size={12} className={isPlaying ? 'animate-pulse text-green-400' : ''} />
            Simulator Sandbox
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-[#94a3b8] border border-[#2a2a3d] backdrop-blur-md">
            RPS: <span className="font-mono text-[#f1f5f9]">{currentRPS}</span> / {targetRPS}
          </span>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 min-h-0 bg-[#0a0a0f]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={sandboxNodeTypes}
            edgeTypes={{ smoothstep: SimulationEdge }}
            onInit={setReactFlowInstance}
            colorMode="dark"
            fitView
            fitViewOptions={{ padding: 0.15 }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#161622" gap={20} size={1.2} />
            <Controls showInteractive={false} className="!bg-[#12121a] !border-[#2a2a3d] !rounded-lg" />
          </ReactFlow>
        </div>

        {/* ─── BOTTOM CONTROL BAR: Advanced Glassmorphic UI ─── */}
        <div className="bg-[#12121a]/95 border-t border-[#2a2a3d] p-4 flex flex-col gap-4 backdrop-blur-md">
          {/* Main Controls Section */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Play/Pause Button Group */}
            <div className="flex items-center gap-2 bg-[#0a0a0f] border border-[#2a2a3d] p-1 rounded-xl">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isPlaying
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                    : 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-400'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause size={13} fill="currentColor" />
                    PAUSE SIM
                  </>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" />
                    START SIM
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                title="Reset simulation parameters"
                className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28] transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Ingress Load Slider */}
            <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-1 bg-[#0a0a0f]/50 border border-[#2a2a3d]/50 rounded-xl">
              <span className="text-[10px] text-[#4a4a6a] font-bold uppercase tracking-wider">Load</span>
              <button
                onClick={() => setTargetRPS(prev => Math.max(10, prev - 500))}
                className="w-6 h-6 rounded-md bg-[#1a1a28] hover:bg-[#222235] text-[#94a3b8] flex items-center justify-center font-bold text-sm"
              >
                <Minus size={11} />
              </button>
              <input
                type="range"
                min="10"
                max="50000"
                step="100"
                value={targetRPS}
                onChange={(e) => {
                  setTrafficPreset('custom')
                  setTargetRPS(Number(e.target.value))
                }}
                className="flex-1 accent-[#3b82f6] h-1 bg-[#1a1a28] rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => setTargetRPS(prev => Math.min(50000, prev + 500))}
                className="w-6 h-6 rounded-md bg-[#1a1a28] hover:bg-[#222235] text-[#94a3b8] flex items-center justify-center font-bold text-sm"
              >
                <Plus size={11} />
              </button>
              <span className="text-xs text-[#e2e8f0] font-mono font-bold w-20 text-right">
                {targetRPS.toLocaleString()} <span className="text-[10px] text-[#4a4a6a]">RPS</span>
              </span>
            </div>

            {/* Presets Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#4a4a6a] font-bold uppercase tracking-wider hidden lg:inline">Traffic Preset</span>
              <select
                value={trafficPreset}
                onChange={(e) => setTrafficPreset(e.target.value)}
                className="bg-[#0a0a0f] border border-[#2a2a3d] text-xs text-[#f1f5f9] rounded-xl px-3 py-2 outline-none focus:border-[#3b82f6] transition-colors"
              >
                <option value="normal">Normal Baseline (500 RPS)</option>
                <option value="flash-sale">⚡ Flash Sale (15k RPS)</option>
                <option value="ddos">☠️ DDoS Attack (80k RPS)</option>
                <option value="ramp-up">📈 Ramp-up (Auto-scale)</option>
                <option value="custom">Custom Configuration</option>
              </select>
            </div>

          </div>

          {/* Chaos Engineering Injectors */}
          <div className="border-t border-[#2a2a3d]/40 pt-3 flex flex-wrap items-center gap-2">
            <span className="text-[9px] text-[#4a4a6a] font-bold uppercase tracking-wider mr-2">Chaos Console:</span>
            
            <button
              onClick={() => toggleChaos('cacheOffline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-150 ${
                chaosState.cacheOffline
                  ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-md shadow-red-500/10'
                  : 'bg-[#0a0a0f] border-[#2a2a3d] text-[#94a3b8] hover:border-red-500/30'
              }`}
            >
              <Flame size={11} className={chaosState.cacheOffline ? 'animate-pulse' : ''} />
              KILL REDIS CACHE
            </button>

            <button
              onClick={() => toggleChaos('gatewayDown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-150 ${
                chaosState.gatewayDown
                  ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-md shadow-red-500/10'
                  : 'bg-[#0a0a0f] border-[#2a2a3d] text-[#94a3b8] hover:border-red-500/30'
              }`}
            >
              <AlertOctagon size={11} className={chaosState.gatewayDown ? 'animate-bounce' : ''} />
              CRASH GATEWAY
            </button>

            <button
              onClick={() => toggleChaos('dbLatencySpike')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-150 ${
                chaosState.dbLatencySpike
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-[#0a0a0f] border-[#2a2a3d] text-[#94a3b8] hover:border-amber-500/30'
              }`}
            >
              <VolumeX size={11} />
              INJECT DB LAG
            </button>

            <button
              onClick={() => toggleChaos('killRandomService')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-150 ${
                chaosState.killRandomService
                  ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-md shadow-red-500/10'
                  : 'bg-[#0a0a0f] border-[#2a2a3d] text-[#94a3b8] hover:border-red-500/30'
              }`}
            >
              <ShieldAlert size={11} />
              KILL INSTANCE
            </button>
          </div>
        </div>

      </div>

      {/* ─── RIGHT PANEL: Telemetry & Logs Sidebar (30% width) ─── */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#2a2a3d] bg-[#12121a] flex flex-col h-full">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-[#2a2a3d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[#3b82f6]" />
            <h3 className="text-xs font-bold text-[#f1f5f9] uppercase tracking-wider">Live Telemetry</h3>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-green-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          </span>
        </div>

        {/* Telemetry Stats & Mini Sparklines */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[360px] border-b border-[#2a2a3d]/50">
          
          {/* Ingress RPS Stat */}
          <div className="bg-[#0a0a0f] border border-[#2a2a3d]/60 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#4a4a6a] uppercase font-bold tracking-wider">
              <span>Traffic Ingress</span>
              <span className="text-[#3b82f6] font-mono">{currentRPS} RPS</span>
            </div>
            <TelemetrySparkline data={rpsHistory} color="#3b82f6" maxVal={80000} />
          </div>

          {/* Average Latency Stat */}
          <div className="bg-[#0a0a0f] border border-[#2a2a3d]/60 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#4a4a6a] uppercase font-bold tracking-wider">
              <span>Average Latency</span>
              <span className={`font-mono ${telemetry.avgLatency > 500 ? 'text-red-400' : telemetry.avgLatency > 150 ? 'text-amber-400' : 'text-[#10b981]'}`}>
                {telemetry.avgLatency >= 1000 ? `${(telemetry.avgLatency / 1000).toFixed(2)}s` : `${Math.round(telemetry.avgLatency)}ms`}
              </span>
            </div>
            <TelemetrySparkline data={latencyHistory} color={telemetry.avgLatency > 500 ? '#ef4444' : telemetry.avgLatency > 150 ? '#f59e0b' : '#10b981'} maxVal={1000} />
          </div>

          {/* Global Error Rate Stat */}
          <div className="bg-[#0a0a0f] border border-[#2a2a3d]/60 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#4a4a6a] uppercase font-bold tracking-wider">
              <span>Error Rate</span>
              <span className={`font-mono ${telemetry.globalErrorRate > 0.1 ? 'text-red-400' : 'text-[#10b981]'}`}>
                {(telemetry.globalErrorRate * 100).toFixed(2)}%
              </span>
            </div>
            <TelemetrySparkline data={errorHistory} color={telemetry.globalErrorRate > 0.1 ? '#ef4444' : '#10b981'} maxVal={1} />
          </div>

          {/* Infrastructure Metrics (Cost, Totals) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#0a0a0f]/50 border border-[#2a2a3d]/30 rounded-xl p-3 text-center">
              <DollarSign size={13} className="text-[#a855f7] mx-auto mb-1" />
              <span className="block text-[8px] text-[#4a4a6a] uppercase font-bold">Estimated Cost</span>
              <span className="text-xs font-bold text-[#e2e8f0] font-mono">${telemetry.estimatedCost.toFixed(2)}<span className="text-[8px] text-[#4a4a6a]">/hr</span></span>
            </div>
            <div className="bg-[#0a0a0f]/50 border border-[#2a2a3d]/30 rounded-xl p-3 text-center">
              <Server size={13} className="text-[#06b6d4] mx-auto mb-1" />
              <span className="block text-[8px] text-[#4a4a6a] uppercase font-bold">Requests Sent</span>
              <span className="text-xs font-bold text-[#e2e8f0] font-mono">{telemetry.totalRequests.toLocaleString()}</span>
            </div>
          </div>

        </div>

        {/* ─── Live Event Console Logs (Bottom half) ─── */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0f]/60">
          <div className="p-3 border-b border-[#2a2a3d]/40 flex items-center gap-1.5 text-[10px] text-[#4a4a6a] font-bold uppercase tracking-wider bg-[#12121a]/30">
            <Terminal size={12} className="text-[#94a3b8]" />
            Simulation Event Log
          </div>
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar">
            {logs.map((log, index) => {
              let textClass = 'text-[#94a3b8]'
              if (log.type === 'success') textClass = 'text-green-400 font-semibold'
              if (log.type === 'warning') textClass = 'text-amber-400'
              if (log.type === 'error') textClass = 'text-red-400 font-bold'
              return (
                <div key={index} className={`leading-relaxed border-l-2 pl-1.5 transition-all duration-150 ${
                  log.type === 'success' ? 'border-green-500/55 bg-green-500/5' :
                  log.type === 'warning' ? 'border-amber-500/55 bg-amber-500/5' :
                  log.type === 'error' ? 'border-red-500/55 bg-red-500/5' : 'border-[#2a2a3d]'
                } ${textClass}`}>
                  {log.text}
                </div>
              )
            })}
            <div ref={consoleEndRef} />
          </div>
        </div>

      </div>

    </div>
  )
}
