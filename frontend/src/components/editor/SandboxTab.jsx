import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
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
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Gauge,
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
        walkthroughMessage: null,
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

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - padding * 2) + padding
    const normalizedVal = maxVal > 0 ? val / maxVal : 0
    const y = height - (normalizedVal * (height - padding * 2) + padding)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeOpacity={0.25}
        points={points}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        points={points}
      />
    </svg>
  )
}

/* ─── Graph Path Builder for Walkthrough Mode ────────────────────────────── */
function buildWalkthroughPath(nodes, edges) {
  let start = nodes.find(n => n.type === 'client');
  if (!start) start = nodes.find(n => !edges.some(e => e.target === n.id));
  if (!start && nodes.length > 0) start = nodes[0];
  if (!start) return { pathNodes: [], pathEdges: [] };

  const pathNodes = [start];
  const pathEdges = [];
  let curr = start;
  const visited = new Set([curr.id]);

  // Greedily traverse down to a database/cache or service leaf node
  while (curr) {
    const outgoing = edges.filter(e => e.source === curr.id && !visited.has(e.target));
    if (outgoing.length === 0) break;
    
    // Priority: DB/Cache > Service > anything else
    let selectedEdge = outgoing.find(e => {
      const targetNode = nodes.find(n => n.id === e.target);
      return targetNode && (targetNode.type === 'database' || targetNode.type === 'cache');
    });
    if (!selectedEdge) {
      selectedEdge = outgoing.find(e => {
        const targetNode = nodes.find(n => n.id === e.target);
        return targetNode && targetNode.type === 'service';
      });
    }
    if (!selectedEdge) selectedEdge = outgoing[0];

    const targetNode = nodes.find(n => n.id === selectedEdge.target);
    if (!targetNode) break;

    pathEdges.push(selectedEdge);
    pathNodes.push(targetNode);
    visited.add(targetNode.id);
    curr = targetNode;
    
    if (curr.type === 'database' || curr.type === 'cache') {
      break;
    }
  }

  return { pathNodes, pathEdges };
}

/* ─── Traversal Payload Helper ────────────────────────────────────────────── */
const getStepPayloadAndData = (node, direction) => {
  const label = node.data?.label || node.id
  if (direction === 'forward') {
    switch(node.type) {
      case 'client':
        return {
          payload: 'HTTP Request',
          inspectData: `GET /api/v1/profile HTTP/1.1\nHost: smartpark.ai\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nAccept: application/json`
        }
      case 'cdn':
        return {
          payload: 'CDN Cache Check',
          inspectData: `CDN Lookup:\n- URI: /api/v1/profile\n- Target Host: CDN Edge Node #412\n- Status: CACHE_MISS (Querying Origin Server)`
        }
      case 'lb':
        return {
          payload: 'Route Request',
          inspectData: `Load Balancer Routing:\n- Method: Round-Robin\n- Target Node: ${label}\n- Protocol: HTTP/2 (TLS v1.3)`
        }
      case 'gateway':
        return {
          payload: 'Auth & Rate-Limit',
          inspectData: `API Gateway Ingress Policies:\n- Decoding JWT: Success\n- Rate Limit Check: 14/60 req/min\n- Client IP: 198.51.100.42`
        }
      case 'service':
        return {
          payload: 'Execute Service API',
          inspectData: `Microservice [${label}] Controller:\n- Class: UserProfileController\n- Method: fetchActiveProfile()\n- Query Param: { userId: 1042 }`
        }
      case 'database':
        return {
          payload: 'Execute SQL Query',
          inspectData: `SELECT u.id, u.email, p.bio \nFROM users u \nJOIN profiles p ON u.id = p.user_id \nWHERE u.id = 1042 \nLIMIT 1;\n-- Executing primary index scan on users(id)...`
        }
      case 'cache':
        return {
          payload: 'Redis GET',
          inspectData: `Redis cache command:\nGET cache:session:1042\n-- Cache Miss. Querying backend database...`
        }
      case 'queue':
        return {
          payload: 'Dispatch Event',
          inspectData: `Kafka Broker:\n- Publish Topic: user-profile-accessed\n- Partition: 1\n- Payload: { "userId": 1042, "time": 1719582650 }`
        }
      default:
        return {
          payload: 'Ingress Packet',
          inspectData: `Forward packet reaching node: ${label}`
        }
    }
  } else {
    // backward/response
    switch(node.type) {
      case 'client':
        return {
          payload: 'Render 200 OK',
          inspectData: `HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 175\n\n{\n  "status": "success",\n  "data": {\n    "id": 1042,\n    "email": "user@smartpark.ai",\n    "bio": "Active system user profile."\n  }\n}`
        }
      case 'cdn':
        return {
          payload: 'Write Edge Cache',
          inspectData: `CDN Cache Write:\n- URI: /api/v1/profile\n- TTL: 300s\n- Status: OK (Edge Cache Updated)`
        }
      case 'lb':
        return {
          payload: 'Egress Forwarding',
          inspectData: `Load Balancer Egress Response:\n- Protocol: HTTPS/TLSv1.3\n- Response Size: 340 bytes`
        }
      case 'gateway':
        return {
          payload: 'Append CORS Headers',
          inspectData: `API Gateway Response Egress:\n- Status: 200 OK\n- CORS Policies Applied: Access-Control-Allow-Origin: *\n- Duration: 14.8ms`
        }
      case 'service':
        return {
          payload: 'Format API JSON',
          inspectData: `Service [${label}] Response Builder:\n- JSON Payload Formatted:\n{\n  "status": "success",\n  "data": { "id": 1042, "email": "user@smartpark.ai" }\n}`
        }
      case 'database':
        return {
          payload: 'Query Rows Result',
          inspectData: `PostgreSQL Database Response:\n- Status: SELECT 1\n- Duration: 2.1ms\n- Row Result: { "id": 1042, "email": "user@smartpark.ai" }`
        }
      case 'cache':
        return {
          payload: 'Cache HIT Payload',
          inspectData: `Redis Cache Response:\n- Status: HIT\n- TTL: 120s\n- Payload: { "userId": 1042, "cached": true }`
        }
      case 'queue':
        return {
          payload: 'Broker ACK',
          inspectData: `Kafka Consumer ACK:\n- Topic Offset: 15982\n- Status: Committed`
        }
      default:
        return {
          payload: 'Egress Packet',
          inspectData: `Response returning from node: ${label}`
        }
    }
  }
}

/* ─── Walkthrough Steps Assembler ────────────────────────────────────────── */
const buildWalkthroughSteps = (pathNodes, pathEdges) => {
  if (pathNodes.length === 0) return []
  const steps = []

  const getFwdMsg = (node) => {
    switch(node.type) {
      case 'client': return 'Client initiates connection (HTTP request)'
      case 'cdn': return 'CDN checks edge caches for matching static content'
      case 'lb': return 'Load Balancer selects target service node'
      case 'gateway': return 'API Gateway performs rate limiting & token authentication'
      case 'service': return 'Service executes core business logic & formats database transaction'
      case 'database': return 'Database running index scans to fetch requested rows'
      case 'cache': return 'Cache checking memory pages for stored payload'
      case 'queue': return 'Message queue buffers request event asynchronously'
      default: return `${node.data?.label || 'Node'} processing request`
    }
  }

  const getBwdMsg = (node) => {
    switch(node.type) {
      case 'client': return 'Client receives response and renders UI page (HTTP 200 OK)'
      case 'cdn': return 'CDN caches the data and returns to load balancer'
      case 'lb': return 'Load Balancer returns egress stream to client client'
      case 'gateway': return 'API Gateway adds security CORS headers to response payload'
      case 'service': return 'Service formats business objects and returns JSON response'
      case 'database': return 'Database returns queried row payload'
      case 'cache': return 'Cache returns memory-hit value'
      case 'queue': return 'Message queue dispatches message acknowledgement'
      default: return `${node.data?.label || 'Node'} returning payload`
    }
  }

  // Step 1: Client start
  const clientStartData = getStepPayloadAndData(pathNodes[0], 'forward')
  steps.push({
    type: 'node',
    targetId: pathNodes[0].id,
    message: 'Client initiates connection (HTTP request)',
    telemetry: { walkthroughMessage: 'Sending HTTP Request...', status: 'normal', utilization: 25 },
    inspectData: clientStartData.inspectData
  })

  // Forward steps
  for (let i = 0; i < pathEdges.length; i++) {
    const edge = pathEdges[i]
    const nextNode = pathNodes[i + 1]
    const edgeData = getStepPayloadAndData(nextNode, 'forward')

    steps.push({
      type: 'edge',
      targetId: edge.id,
      direction: 'forward',
      message: `Request traveling from ${pathNodes[i].data?.label || pathNodes[i].id} to ${nextNode.data?.label || nextNode.id}`,
      payload: edgeData.payload,
      inspectData: `Edge Packet Transmission:\n- Source: ${pathNodes[i].data?.label || pathNodes[i].id}\n- Target: ${nextNode.data?.label || nextNode.id}\n- Payload Type: ${edgeData.payload}`
    })

    steps.push({
      type: 'node',
      targetId: nextNode.id,
      message: getFwdMsg(nextNode),
      telemetry: {
        walkthroughMessage: getFwdMsg(nextNode),
        status: nextNode.type === 'database' || nextNode.type === 'cache' ? 'normal' : 'warning',
        utilization: 70
      },
      inspectData: edgeData.inspectData
    })
  }

  // Reverse steps
  for (let i = pathEdges.length - 1; i >= 0; i--) {
    const edge = pathEdges[i]
    const prevNode = pathNodes[i]
    const edgeData = getStepPayloadAndData(prevNode, 'backward')

    steps.push({
      type: 'edge',
      targetId: edge.id,
      direction: 'backward',
      message: `Response returning back from ${pathEdges[i].target} to ${prevNode.data?.label || prevNode.id}`,
      payload: edgeData.payload,
      inspectData: `Edge Packet Response Transmission:\n- Source: ${pathEdges[i].target}\n- Target: ${prevNode.data?.label || prevNode.id}\n- Response Payload: ${edgeData.payload}`
    })

    steps.push({
      type: 'node',
      targetId: prevNode.id,
      message: getBwdMsg(prevNode),
      telemetry: {
        walkthroughMessage: getBwdMsg(prevNode),
        status: 'normal',
        utilization: 45
      },
      inspectData: edgeData.inspectData
    })
  }

  return steps
}

/* ─── SandboxTab Component ────────────────────────────────────────────────── */
export default function SandboxTab({ design }) {
  const blueprintNodes = design?.hld?.nodes || []
  const blueprintEdges = design?.hld?.edges || []

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(convertToSandboxNodes(blueprintNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(convertToSimulationEdges(blueprintEdges))
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  
  // Wrapper ref for Fullscreen
  const reactFlowWrapper = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Mode Selection: 'load' (continuous simulation) or 'walkthrough' (step-by-step)
  const [simMode, setSimMode] = useState('load')

  // Simulation Controls (Continuous)
  const [isPlaying, setIsPlaying] = useState(false)
  const [targetRPS, setTargetRPS] = useState(100)
  const [currentRPS, setCurrentRPS] = useState(100)
  const [trafficPreset, setTrafficPreset] = useState('normal')

  // Chaos Engineering (Continuous)
  const [chaosState, setChaosState] = useState({
    cacheOffline: false,
    gatewayDown: false,
    dbLatencySpike: false,
    killRandomService: false,
  })

  // Walkthrough State Machine
  const [walkthroughStep, setWalkthroughStep] = useState(null) // null = idle, 0 to walkthroughSteps.length - 1
  const [isPlayingWalkthrough, setIsPlayingWalkthrough] = useState(false)
  const [walkthroughSpeed, setWalkthroughSpeed] = useState(1500) // delay in ms

  // Core metrics & history histories
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

  // Build walkthrough path nodes and steps dynamically
  const walkthroughData = useMemo(() => {
    return buildWalkthroughPath(blueprintNodes, blueprintEdges)
  }, [blueprintNodes, blueprintEdges])

  const walkthroughSteps = useMemo(() => {
    return buildWalkthroughSteps(walkthroughData.pathNodes, walkthroughData.pathEdges)
  }, [walkthroughData])

  // Auto-scroll log console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Add a line of log
  const addLog = useCallback((text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev.slice(-39), { type, text: `[${timestamp}] ${text}` }])
  }, [])

  // Fullscreen support
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
          reactFlowInstance.fitView({ padding: 0.15, duration: 250 })
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

  // Reset simulation when mode switches
  useEffect(() => {
    handleReset()
    if (simMode === 'walkthrough') {
      addLog('📚 Entered Step-by-Step Educational Walkthrough Mode. Click Send Request to trace data flows.', 'info')
    } else {
      addLog('📊 Entered Continuous Load-Testing Mode.', 'info')
    }
  }, [simMode])

  // Continuous Presets Trigger
  useEffect(() => {
    if (simMode !== 'load') return
    if (trafficPreset === 'normal') {
      setTargetRPS(500)
      addLog('Traffic preset: Normal Baseline (500 RPS).', 'info')
    } else if (trafficPreset === 'flash-sale') {
      setTargetRPS(15000)
      addLog('⚡ FLASH SALE SPIKE triggered! Injecting high traffic (15,000 RPS).', 'warning')
    } else if (trafficPreset === 'ddos') {
      setTargetRPS(80000)
      addLog('☠️ DDoS ATTACK initiated! flooding gateway with traffic (80,000 RPS).', 'error')
    } else if (trafficPreset === 'ramp-up') {
      setTargetRPS(100)
      addLog('Gradual traffic ramp-up started.', 'info')
    }
  }, [trafficPreset, simMode, addLog])

  // Ramp-up interval
  useEffect(() => {
    if (!isPlaying || trafficPreset !== 'ramp-up' || simMode !== 'load') return

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
  }, [isPlaying, trafficPreset, simMode, addLog])

  // Reset State
  const handleReset = () => {
    setIsPlaying(false)
    setIsPlayingWalkthrough(false)
    setWalkthroughStep(null)
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
    setLogs([{ type: 'info', text: `🧪 Simulator reset. Mode: ${simMode === 'load' ? 'Load' : 'Walkthrough'}` }])
  }

  // Toggle Chaos Node status
  const toggleChaos = (type) => {
    setChaosState((prev) => {
      const next = { ...prev, [type]: !prev[type] }
      if (type === 'cacheOffline') {
        addLog(next.cacheOffline ? '💥 Chaos: Cache layer offline (Redis nodes flushed & killed)!' : '✅ Cache layer restored.', next.cacheOffline ? 'error' : 'success')
      } else if (type === 'gatewayDown') {
        addLog(next.gatewayDown ? '🚨 Chaos: API Gateway server killed! 100% network drop.' : '✅ API Gateway restarted.', next.gatewayDown ? 'error' : 'success')
      } else if (type === 'dbLatencySpike') {
        addLog(next.dbLatencySpike ? '⚠️ Chaos: Database replica replication lagged. Read locks active.' : '✅ Database locking cleared.', next.dbLatencySpike ? 'warning' : 'success')
      } else if (type === 'killRandomService') {
        if (next.killRandomService) {
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

  // Walkthrough step advancement handler
  const triggerWalkthroughStep = useCallback((stepIdx) => {
    if (stepIdx === null || stepIdx < 0 || stepIdx >= walkthroughSteps.length) {
      setNodes(convertToSandboxNodes(blueprintNodes))
      setEdges(convertToSimulationEdges(blueprintEdges))
      return
    }

    const step = walkthroughSteps[stepIdx]
    addLog(step.message, step.type === 'edge' ? 'info' : 'success')

    const activeNodeId = step.type === 'node' ? step.targetId : null
    const activeEdgeId = step.type === 'edge' ? step.targetId : null
    const isFinalStep = stepIdx === walkthroughSteps.length - 1

    // Update nodes with walkthrough tooltips, dimming, and success ripple
    setNodes((nds) =>
      nds.map((n) => {
        const isTarget = n.id === step.targetId
        const isActiveNode = n.id === activeNodeId
        
        // Active path dimming logic
        const isNodeInPath = walkthroughData.pathNodes.some(pn => pn.id === n.id)
        const opacity = isActiveNode ? 1 : isNodeInPath ? 0.65 : 0.25

        return {
          ...n,
          style: { opacity, transition: 'opacity 0.3s' },
          data: {
            ...n.data,
            telemetry: {
              ...n.data.telemetry,
              walkthroughMessage: isTarget && step.type === 'node' ? step.telemetry.walkthroughMessage : null,
              status: isTarget && step.type === 'node' ? step.telemetry.status : 'normal',
              utilization: isTarget && step.type === 'node' ? step.telemetry.utilization : 0,
              successRipple: isFinalStep && n.id === walkthroughData.pathNodes[0]?.id,
            },
          },
        }
      })
    )

    // Update edges with packet coordinate pulses, dimming, and text payloads
    setEdges((eds) =>
      eds.map((e) => {
        const isTarget = e.id === step.targetId
        const isActiveEdge = e.id === activeEdgeId
        const activeState = isTarget && step.type === 'edge' ? `walkthrough-${step.direction}` : 'idle'

        // Active path dimming logic
        const isEdgeInPath = walkthroughData.pathEdges.some(pe => pe.id === e.id)
        const opacity = isActiveEdge ? 1 : isEdgeInPath ? 0.5 : 0.15

        let pColor = '#a855f7' // purple educational packets

        return {
          ...e,
          style: {
            stroke: activeState !== 'idle' ? pColor : '#2a2a3d',
            strokeWidth: activeState !== 'idle' ? 2 : 1.5,
            opacity,
            transition: 'stroke 0.3s, opacity 0.3s',
          },
          data: {
            state: activeState,
            speed: walkthroughSpeed === 800 ? 2 : walkthroughSpeed === 2500 ? 0.5 : 1,
            packetColor: pColor,
            payload: isTarget && step.type === 'edge' ? step.payload : null,
          },
        }
      })
    )

    // Update charts telemetry data
    setTelemetry((prev) => ({
      ...prev,
      avgLatency: step.type === 'node' && step.targetId === 'database' ? 120 : 15,
      globalErrorRate: 0,
      totalRequests: prev.totalRequests + (stepIdx === 0 ? 1 : 0),
    }))
  }, [walkthroughSteps, blueprintNodes, blueprintEdges, walkthroughSpeed, addLog, setNodes, setEdges])

  // Walkthrough navigation triggers
  const handleNextStep = useCallback(() => {
    setWalkthroughStep((prev) => {
      if (prev === null) return 0
      if (prev >= walkthroughSteps.length - 1) {
        setIsPlayingWalkthrough(false)
        addLog('🎓 Step-by-Step request cycle completed! (HTTP 200 OK)', 'success')
        return null
      }
      return prev + 1
    })
  }, [walkthroughSteps, addLog])

  const handlePrevStep = useCallback(() => {
    setWalkthroughStep((prev) => {
      if (prev === null || prev <= 0) return null
      return prev - 1
    })
  }, [])

  // Walkthrough step trigger hook
  useEffect(() => {
    if (simMode === 'walkthrough') {
      triggerWalkthroughStep(walkthroughStep)
    }
  }, [walkthroughStep, simMode, triggerWalkthroughStep])

  // Walkthrough Auto-Play slideshow loop
  useEffect(() => {
    if (!isPlayingWalkthrough || simMode !== 'walkthrough') return

    const timer = setInterval(() => {
      handleNextStep()
    }, walkthroughSpeed)

    return () => clearInterval(timer)
  }, [isPlayingWalkthrough, simMode, walkthroughSpeed, handleNextStep])

  // Continuous Simulation calculations interval loop
  useEffect(() => {
    if (simMode !== 'load' || !isPlaying) {
      if (simMode === 'load') {
        setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, state: 'idle' } })))
      }
      return
    }

    const interval = setInterval(() => {
      const diff = targetRPS - currentRPS
      let step = Math.sign(diff) * Math.max(10, Math.min(Math.abs(diff) * 0.3, 3000))
      if (Math.abs(diff) < 10) step = diff
      const newCurrentRPS = Math.round(currentRPS + step)
      setCurrentRPS(newCurrentRPS)

      // Ingress load metrics calculations
      const flowRPS = {}
      const nodeCapacity = {}

      nodes.forEach(n => {
        flowRPS[n.id] = 0
        const capInfo = CAPACITIES[n.type] || { max: 2000, latency: 10 }
        nodeCapacity[n.id] = capInfo.max
      })

      const hasIncoming = new Set(edges.map(e => e.target))
      let entryNodes = nodes.filter(n => n.type === 'client')
      if (entryNodes.length === 0) {
        entryNodes = nodes.filter(n => !hasIncoming.has(n.id))
      }
      if (entryNodes.length === 0 && nodes.length > 0) {
        entryNodes = [nodes[0]]
      }

      if (entryNodes.length > 0) {
        const splitRps = newCurrentRPS / entryNodes.length
        entryNodes.forEach(n => {
          flowRPS[n.id] = splitRps
        })
      }

      const activeEdges = {}
      for (let iter = 0; iter < 5; iter++) {
        edges.forEach(e => {
          const srcId = e.source
          const tgtId = e.target
          
          if (chaosState.gatewayDown && (srcId === 'gateway' || tgtId === 'gateway' || nodes.find(n => n.id === srcId)?.type === 'gateway' || nodes.find(n => n.id === tgtId)?.type === 'gateway')) {
            activeEdges[e.id] = { state: 'error', speed: 0, rps: 0 }
            return
          }

          const srcNode = nodes.find(n => n.id === srcId)
          const tgtNode = nodes.find(n => n.id === tgtId)
          if (!srcNode || !tgtNode) return

          const isSrcOffline = srcNode.id === killedServiceId || (srcNode.type === 'gateway' && chaosState.gatewayDown)
          if (isSrcOffline) {
            activeEdges[e.id] = { state: 'dead', speed: 0, rps: 0 }
            return
          }

          const outgoingEdges = edges.filter(ed => ed.source === srcId)
          const healthyOutgoing = outgoingEdges.filter(ed => ed.target !== killedServiceId)

          let distributedRPS = 0
          if (srcNode.type === 'lb') {
            const index = healthyOutgoing.findIndex(ed => ed.id === e.id)
            if (index !== -1) {
              distributedRPS = flowRPS[srcId] / healthyOutgoing.length
            }
          } else if (srcNode.type === 'cdn') {
            const hitRatio = chaosState.cacheOffline ? 0 : (CAPACITIES.cdn.cacheHitRate || 0.85)
            if (e.target === 'cache' || tgtNode.type === 'cache') {
              distributedRPS = flowRPS[srcId] * hitRatio
            } else {
              distributedRPS = flowRPS[srcId] * (1 - hitRatio)
            }
          } else if (srcNode.type === 'cache') {
            const hitRatio = chaosState.cacheOffline ? 0 : (CAPACITIES.cache.cacheHitRate || 0.80)
            distributedRPS = flowRPS[srcId] * (1 - hitRatio)
          } else {
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

        let activeInst = serviceInstances[node.id] || 1
        let maxCap = cap.max * activeInst
        
        if (type === 'service' && incoming > maxCap * 0.85 && activeInst < 4 && !isNodeOffline) {
          activeInst += 1
          setServiceInstances(prev => ({ ...prev, [node.id]: activeInst }))
          addLog(`📈 Auto-scaling: Scaled ${node.data?.label || node.id} to x${activeInst} instances.`, 'success')
        } else if (type === 'service' && incoming < maxCap * 0.3 && activeInst > 1 && !isNodeOffline) {
          activeInst -= 1
          setServiceInstances(prev => ({ ...prev, [node.id]: activeInst }))
          addLog(`📉 Auto-scaling: Scaled down ${node.data?.label || node.id} to x${activeInst} instances.`, 'info')
        }

        let util = isNodeOffline ? 0 : Math.min(100, (incoming / maxCap) * 100)
        
        let baseLat = cap.latency
        if (type === 'database' && chaosState.dbLatencySpike) {
          baseLat += 120
        }
        
        let lat = baseLat
        if (util > 0) {
          const excess = maxCap - incoming
          const queueDelay = excess > 0 ? (1000 / excess) : 2000
          lat = baseLat + Math.min(5000, queueDelay)
        }

        let errRate = cap.err
        if (isNodeOffline) {
          errRate = 1.0
        } else if (util > 95) {
          errRate = cap.err + (util - 95) / 10
        }

        let status = 'normal'
        if (isNodeOffline) status = 'offline'
        else if (util > 95 || errRate > 0.3) status = 'critical'
        else if (util > 75) status = 'warning'

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
              walkthroughMessage: null,
            },
          },
        }
      })

      const avgLat = totalNodesMeasured > 0 ? totalLatencySum / totalNodesMeasured : 15
      const globalErr = totalNodeIncoming > 0 ? totalNodeErrors / totalNodeIncoming : 0
      
      setLatencyHistory((prev) => [...prev.slice(-19), avgLat])
      setErrorHistory((prev) => [...prev.slice(-19), globalErr])
      setRpsHistory((prev) => [...prev.slice(-19), newCurrentRPS])

      const totalInstances = updatedNodes.reduce((acc, curr) => acc + (curr.data?.telemetry?.activeInstances || 1), 0)
      const hourlyCost = totalInstances * 0.045 + (newCurrentRPS * 0.0005)

      setTelemetry((prev) => ({
        avgLatency: avgLat,
        globalErrorRate: globalErr,
        totalRequests: prev.totalRequests + Math.round(newCurrentRPS * 0.2),
        estimatedCost: hourlyCost,
      }))

      setNodes(updatedNodes)

      setEdges((eds) =>
        eds.map((edge) => {
          const flowInfo = activeEdges[edge.id] || { state: 'idle', speed: 1, rps: 0 }
          let pColor = '#10b981'
          if (flowInfo.state === 'running' && flowInfo.rps > 2000) pColor = '#f59e0b'
          if (flowInfo.state === 'error') pColor = '#ef4444'

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
    }, 200)

    return () => clearInterval(interval)
  }, [isPlaying, targetRPS, currentRPS, nodes, edges, chaosState, killedServiceId, serviceInstances, addLog, simMode])

  return (
    <div
      ref={reactFlowWrapper}
      id="sandbox-tab"
      className="relative flex flex-col md:flex-row h-[750px] bg-[#0a0a0f] border border-[#2a2a3d] rounded-2xl overflow-hidden"
    >
      
      {/* ─── LEFT PANEL: Flow Whiteboard (70% width) ─── */}
      <div className="relative flex-1 h-full flex flex-col min-w-0">
        
        {/* Canvas Overlay Header Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {/* Mode Switcher Buttons */}
          <div className="flex bg-black/40 border border-[#2a2a3d] p-0.5 rounded-full backdrop-blur-md">
            <button
              onClick={() => setSimMode('load')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-200 ${
                simMode === 'load'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              <Gauge size={10} />
              Load Simulator
            </button>
            <button
              onClick={() => setSimMode('walkthrough')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-200 ${
                simMode === 'walkthrough'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              <BookOpen size={10} />
              Walkthrough Mode
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-black/40 text-[#94a3b8] border border-[#2a2a3d] hover:text-[#f1f5f9] hover:bg-[#1a1a28] backdrop-blur-md transition-colors"
          >
            {isFullscreen ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
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

        {/* ─── BOTTOM CONTROL BAR: Advanced UI Controls ─── */}
        <div className="bg-[#12121a]/95 border-t border-[#2a2a3d] p-4 flex flex-col gap-4 backdrop-blur-md">
          
          {/* Mode 1: Continuous Ingress Load Controls */}
          {simMode === 'load' && (
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

              {/* Presets dropdown */}
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
          )}

          {/* Mode 2: Step-by-Step Educational Walkthrough Controls */}
          {simMode === 'walkthrough' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Playback Buttons */}
              <div className="flex items-center gap-2 bg-[#0a0a0f] border border-[#2a2a3d] p-1 rounded-xl">
                
                {/* Send Request Trigger */}
                {walkthroughStep === null ? (
                  <button
                    onClick={() => setWalkthroughStep(0)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#a855f7] hover:bg-[#a855f7]/90 text-white shadow-lg shadow-purple-600/20"
                  >
                    <Plus size={13} />
                    SEND REQUEST
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPlayingWalkthrough(!isPlayingWalkthrough)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                      isPlayingWalkthrough
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500'
                    }`}
                  >
                    {isPlayingWalkthrough ? (
                      <>
                        <Pause size={13} fill="currentColor" />
                        PAUSE AUTO
                      </>
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" />
                        AUTO PLAY
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handlePrevStep}
                  disabled={walkthroughStep === null || walkthroughStep === 0}
                  className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={walkthroughStep === null}
                  className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1a1a28] transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Pipeline Step Tracker Visualizer */}
              <div className="flex-1 min-w-[250px] flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0a0a0f]/50 border border-[#2a2a3d]/50 rounded-xl overflow-x-auto no-scrollbar">
                {walkthroughData.pathNodes.map((n, idx) => {
                  const step = walkthroughSteps[walkthroughStep]
                  const isNodeActive = step?.type === 'node' && step.targetId === n.id
                  const isIncomingEdgeActive = step?.type === 'edge' && step.targetId === walkthroughData.pathEdges[idx - 1]?.id

                  return (
                    <React.Fragment key={n.id}>
                      {idx > 0 && (
                        <ArrowRight
                          size={11}
                          className={`transition-colors flex-shrink-0 ${
                            isIncomingEdgeActive
                              ? 'text-[#a855f7] scale-110 duration-300'
                              : 'text-[#4a4a6a]'
                          }`}
                        />
                      )}
                      <span
                        className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border transition-all duration-300 whitespace-nowrap ${
                          isNodeActive
                            ? 'bg-[#a855f7]/15 border-[#a855f7] text-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-black/30 border-[#2a2a3d]/50 text-[#94a3b8]'
                        }`}
                      >
                        {n.data?.label || n.id}
                      </span>
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#4a4a6a] font-bold uppercase tracking-wider hidden lg:inline">Play Speed</span>
                <select
                  value={walkthroughSpeed}
                  onChange={(e) => setWalkthroughSpeed(Number(e.target.value))}
                  className="bg-[#0a0a0f] border border-[#2a2a3d] text-xs text-[#f1f5f9] rounded-xl px-3 py-2 outline-none focus:border-[#3b82f6] transition-colors font-mono"
                >
                  <option value={2500}>0.5x (Slow)</option>
                  <option value={1500}>1.0x (Normal)</option>
                  <option value={800}>2.0x (Fast)</option>
                </select>
              </div>

            </div>
          )}

          {/* Chaos Console Injectors */}
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
            <h3 className="text-xs font-bold text-[#f1f5f9] uppercase tracking-wider">
              {simMode === 'load' ? 'Live Telemetry' : 'Walkthrough Steps'}
            </h3>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying || isPlayingWalkthrough ? 'bg-green-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying || isPlayingWalkthrough ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          </span>
        </div>

        {/* Telemetry Stats & Mini Sparklines */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[360px] border-b border-[#2a2a3d]/50">
          {simMode === 'load' ? (
            <>
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
            </>
          ) : (
            <div className="bg-[#0a0a0f] border border-[#2a2a3d]/60 rounded-xl p-4 space-y-3">
              <div className="text-[10px] text-[#4a4a6a] font-bold uppercase tracking-wider">Active Walkthrough Path</div>
              <div className="text-xs text-[#f1f5f9] leading-relaxed">
                {walkthroughStep !== null ? (
                  <>
                    <div className="text-[10px] font-mono text-[#a855f7] mb-1 font-bold">
                      STEP {walkthroughStep + 1} OF {walkthroughSteps.length}
                    </div>
                    <p className="text-sm font-semibold">{walkthroughSteps[walkthroughStep].message}</p>
                    <div className="mt-3 w-full bg-[#161622] rounded-full h-1">
                      <div
                        className="bg-[#a855f7] h-full rounded-full transition-all duration-300"
                        style={{ width: `${((walkthroughStep + 1) / walkthroughSteps.length) * 100}%` }}
                      />
                    </div>

                    {/* Syntax Highlighted Payload/SQL Telemetry Drawer */}
                    {walkthroughSteps[walkthroughStep].inspectData && (
                      <div className="mt-4 pt-3 border-t border-[#2a2a3d]/40">
                        <div className="text-[9px] text-[#4a4a6a] font-bold uppercase tracking-wider mb-2 font-sans">
                          Payload / Query Telemetry
                        </div>
                        <pre className="p-2.5 rounded-lg bg-black/60 border border-[#2a2a3d]/45 font-mono text-[9px] leading-relaxed text-[#c084fc] overflow-x-auto whitespace-pre select-text max-h-[160px] custom-scrollbar shadow-inner">
                          {walkthroughSteps[walkthroughStep].inspectData}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[#94a3b8] italic">Click "Send Request" to trace the path and view explanation cards.</p>
                )}
              </div>
            </div>
          )}

          {/* Infrastructure Metrics (Cost, Totals) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#0a0a0f]/50 border border-[#2a2a3d]/30 rounded-xl p-3 text-center">
              <DollarSign size={13} className="text-[#a855f7] mx-auto mb-1" />
              <span className="block text-[8px] text-[#4a4a6a] uppercase font-bold">Estimated Cost</span>
              <span className="text-xs font-bold text-[#e2e8f0] font-mono">${telemetry.estimatedCost.toFixed(2)}<span className="text-[8px] text-[#4a4a6a]">/hr</span></span>
            </div>
            <div className="bg-[#0a0a0f]/50 border border-[#2a2a3d]/30 rounded-xl p-3 text-center">
              <Server size={13} className="text-[#06b6d4] mx-auto mb-1" />
              <span className="block text-[8px] text-[#4a4a6a] uppercase font-bold">{simMode === 'load' ? 'Requests Sent' : 'Total Traces'}</span>
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
              if (log.type === 'success') textClass = 'text-[#c084fc] font-semibold' // purple logs for walkthrough
              if (log.type === 'warning') textClass = 'text-amber-400'
              if (log.type === 'error') textClass = 'text-red-400 font-bold'
              return (
                <div key={index} className={`leading-relaxed border-l-2 pl-1.5 transition-all duration-150 ${
                  log.type === 'success' ? 'border-[#a855f7]/55 bg-[#a855f7]/5' :
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
