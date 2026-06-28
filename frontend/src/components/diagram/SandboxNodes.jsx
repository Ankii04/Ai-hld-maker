import React from 'react'
import { Handle } from '@xyflow/react'
import {
  Monitor,
  Smartphone,
  Globe,
  GitBranch,
  Shield,
  Server,
  Database,
  Zap,
  MessageSquare,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from 'lucide-react'

/* ─── Shared Sandbox Node Shell ─────────────────────────────────────────── */
function SandboxNodeShell({
  id,
  selected,
  icon: Icon,
  iconColor,
  label,
  technology,
  telemetry = {},
  targetPosition = 'top',
  sourcePosition = 'bottom',
}) {
  const {
    utilization = 0,
    latency = 0,
    errorRate = 0,
    isOffline = false,
    activeInstances = 1,
    status = 'normal', // 'normal', 'warning', 'critical', 'offline'
  } = telemetry

  // Colors & visual status config
  let glowColor = '#3b82f6'
  let borderColor = '#2a2a3d'
  let bgGradient = 'from-[#0d0d1a] to-[#070710]'
  let statusText = 'HEALTHY'
  let statusColor = 'text-green-400'

  if (isOffline || status === 'offline') {
    glowColor = '#ef4444'
    borderColor = '#dc262644'
    bgGradient = 'from-[#1a0f0f] to-[#0f0707] grayscale opacity-75'
    statusText = 'OFFLINE'
    statusColor = 'text-red-500 font-bold'
  } else if (status === 'critical') {
    glowColor = '#ef4444'
    borderColor = '#ef4444'
    bgGradient = 'from-[#1e0f10] to-[#0c0506]'
    statusText = 'CRITICAL'
    statusColor = 'text-red-400 animate-pulse'
  } else if (status === 'warning') {
    glowColor = '#f59e0b'
    borderColor = '#d97706'
    bgGradient = 'from-[#1c140a] to-[#0d0a05]'
    statusText = 'HIGH LOAD'
    statusColor = 'text-amber-400'
  }

  // Calculate dynamic colors for utilization bar
  let barColor = 'bg-blue-500'
  if (utilization > 90) barColor = 'bg-red-500'
  else if (utilization > 70) barColor = 'bg-amber-500 animate-pulse'
  else if (utilization > 0) barColor = 'bg-green-500'

  return (
    <div
      className={`relative rounded-2xl min-w-[170px] max-w-[230px] border transition-all duration-300 bg-gradient-to-br ${bgGradient} overflow-hidden shadow-xl`}
      style={{
        borderColor: selected ? glowColor : borderColor,
        boxShadow: selected
          ? `0 0 20px 2px ${glowColor}44, 0 8px 32px rgba(0,0,0,0.6)`
          : `0 4px 24px rgba(0,0,0,0.5), ${status !== 'normal' ? `0 0 10px ${glowColor}15` : 'none'}`,
      }}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={targetPosition}
        style={{
          background: isOffline ? '#ef4444' : '#3b82f6',
          border: '2px solid #0a0a0f',
          width: 8,
          height: 8,
        }}
      />

      {/* Header strip */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3d]/50 bg-black/30">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon size={13} style={{ color: isOffline ? '#ef4444' : iconColor }} className="flex-shrink-0" />
          <span className="text-[#f1f5f9] text-[11px] font-bold truncate leading-none">
            {label}
          </span>
        </div>
        {activeInstances > 1 && !isOffline && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold font-mono">
            x{activeInstances}
          </span>
        )}
      </div>

      {/* Body / Telemetry statistics */}
      <div className="p-3 space-y-2">
        {/* Status Indicator */}
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider">
          <span className="text-[#4a4a6a] font-bold">Status</span>
          <span className={`font-semibold font-mono ${statusColor} flex items-center gap-1`}>
            {isOffline ? (
              <XCircle size={10} className="text-red-500" />
            ) : status === 'critical' ? (
              <AlertTriangle size={10} className="text-red-400 animate-bounce" />
            ) : status === 'warning' ? (
              <AlertTriangle size={10} className="text-amber-400" />
            ) : (
              <CheckCircle size={10} className="text-green-400" />
            )}
            {statusText}
          </span>
        </div>

        {/* Utilization Slider/Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-[#4a4a6a] font-bold uppercase">Resource Load</span>
            <span className="text-[#94a3b8] font-bold font-mono">{Math.round(utilization)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#161622] overflow-hidden border border-[#2a2a3d]/30">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2a2a3d]/30">
          <div>
            <span className="block text-[8px] text-[#4a4a6a] font-bold uppercase">Latency</span>
            <span className="text-[10px] text-[#e2e8f0] font-semibold font-mono">
              {isOffline ? '-' : latency >= 1000 ? `${(latency / 1000).toFixed(2)}s` : `${Math.round(latency)}ms`}
            </span>
          </div>
          <div>
            <span className="block text-[8px] text-[#4a4a6a] font-bold uppercase">Error Rate</span>
            <span className={`text-[10px] font-semibold font-mono ${(errorRate > 0 && !isOffline) ? 'text-red-400' : 'text-[#e2e8f0]'}`}>
              {isOffline ? '-' : `${(errorRate * 100).toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Technology Tag */}
        {technology && (
          <div className="pt-1.5 flex justify-end">
            <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#1a1a2c]/50 text-[#94a3b8] border border-[#2a2a3d]/60 font-mono">
              {technology}
            </span>
          </div>
        )}
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        style={{
          background: isOffline ? '#ef4444' : '#3b82f6',
          border: '2px solid #0a0a0f',
          width: 8,
          height: 8,
        }}
      />
    </div>
  )
}

/* ─── Sandbox Node Type Mappings ─────────────────────────────────────────── */
export const SandboxClientNode = (props) => (
  <SandboxNodeShell {...props} icon={props.data?.deviceType === 'mobile' ? Smartphone : Monitor} iconColor="#94a3b8" label={props.data?.label || 'Client'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const SandboxCDNNode = (props) => (
  <SandboxNodeShell {...props} icon={Globe} iconColor="#fb923c" label={props.data?.label || 'CDN'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const SandboxLBNode = (props) => (
  <SandboxNodeShell {...props} icon={GitBranch} iconColor="#fbbf24" label={props.data?.label || 'Load Balancer'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const SandboxGatewayNode = (props) => (
  <SandboxNodeShell {...props} icon={Shield} iconColor="#c084fc" label={props.data?.label || 'API Gateway'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const SandboxServiceNode = (props) => (
  <SandboxNodeShell {...props} icon={Server} iconColor="#60a5fa" label={props.data?.label || 'Service'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const SandboxDatabaseNode = (props) => (
  <SandboxNodeShell {...props} icon={Database} iconColor="#4ade80" label={props.data?.label || 'Database'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const SandboxCacheNode = (props) => (
  <SandboxNodeShell {...props} icon={Zap} iconColor="#ef4444" label={props.data?.label || 'Cache'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const SandboxQueueNode = (props) => (
  <SandboxNodeShell {...props} icon={MessageSquare} iconColor="#ec4899" label={props.data?.label || 'Queue'} technology={props.data?.technology} telemetry={props.data?.telemetry} />
)

export const sandboxNodeTypes = {
  client: SandboxClientNode,
  cdn: SandboxCDNNode,
  lb: SandboxLBNode,
  gateway: SandboxGatewayNode,
  service: SandboxServiceNode,
  database: SandboxDatabaseNode,
  cache: SandboxCacheNode,
  queue: SandboxQueueNode,
}
