import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
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
} from 'lucide-react'

/* ─── Shared node shell ─────────────────────────────────────────────────── */
function NodeShell({
  id,
  selected,
  headerBg,
  headerBorder,
  glowColor,
  icon: Icon,
  iconColor,
  label,
  description,
  technology,
  children,
  targetPosition = 'top',
  sourcePosition = 'bottom',
}) {
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(label)

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className="relative rounded-xl min-w-[160px] max-w-[220px] transition-all duration-200 cursor-default animate-fade-in"
      style={{
        background: '#0d0d1a',
        border: `1.5px solid ${selected ? glowColor : headerBorder}`,
        boxShadow: selected
          ? `0 0 16px 2px ${glowColor}40, 0 8px 32px ${glowColor}22`
          : '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Dynamic Target Handle */}
      <Handle
        type="target"
        position={targetPosition}
        style={{
          background: glowColor,
          border: '2px solid #0d0d1a',
          width: 10,
          height: 10,
        }}
      />

      {/* Header strip */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}
      >
        <Icon size={14} style={{ color: iconColor }} />
        {editing ? (
          <input
            autoFocus
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            className="bg-transparent text-[#f1f5f9] text-xs font-semibold outline-none border-b border-[#3b82f6] w-full"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-[#f1f5f9] text-xs font-semibold truncate leading-none">
            {editLabel || label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        {description && (
          <p
            className="text-[#94a3b8] text-[10px] leading-relaxed mb-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
        {children}
        {technology && (
          <span
            className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide animate-pulse-glow"
            style={{ background: `${glowColor}22`, color: glowColor, border: `1px solid ${glowColor}44` }}
          >
            {technology}
          </span>
        )}
      </div>

      {/* Dynamic Source Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        style={{
          background: glowColor,
          border: '2px solid #0d0d1a',
          width: 10,
          height: 10,
        }}
      />
    </div>
  )
}

/* ─── ClientNode ────────────────────────────────────────────────────────── */
export function ClientNode({ data, selected, targetPosition, sourcePosition }) {
  const Icon = data?.deviceType === 'mobile' ? Smartphone : Monitor
  return (
    <NodeShell
      selected={selected}
      targetPosition={targetPosition}
      sourcePosition={sourcePosition}
      headerBg="#1e293b"
      headerBorder="#475569"
      glowColor="#64748b"
      icon={Icon}
      iconColor="#94a3b8"
      label={data?.label || 'Client'}
      description={data?.description}
      technology={data?.technology}
    />
  )
}

/* ─── CDNNode ────────────────────────────────────────────────────────────── */
export function CDNNode({ data, selected, targetPosition, sourcePosition }) {
  return (
    <NodeShell
      selected={selected}
      targetPosition={targetPosition}
      sourcePosition={sourcePosition}
      headerBg="#431407"
      headerBorder="#c2410c"
      glowColor="#f97316"
      icon={Globe}
      iconColor="#fb923c"
      label={data?.label || 'CDN'}
      description={data?.description}
      technology={data?.technology}
    />
  )
}

/* ─── LoadBalancerNode ───────────────────────────────────────────────────── */
export function LoadBalancerNode({ data, selected, targetPosition, sourcePosition }) {
  return (
    <NodeShell
      selected={selected}
      targetPosition={targetPosition}
      sourcePosition={sourcePosition}
      headerBg="#422006"
      headerBorder="#d97706"
      glowColor="#f59e0b"
      icon={GitBranch}
      iconColor="#fbbf24"
      label={data?.label || 'Load Balancer'}
      description={data?.description}
      technology={data?.technology}
    />
  )
}

/* ─── GatewayNode ────────────────────────────────────────────────────────── */
export function GatewayNode({ data, selected, targetPosition, sourcePosition }) {
  return (
    <NodeShell
      selected={selected}
      targetPosition={targetPosition}
      sourcePosition={sourcePosition}
      headerBg="#3b0764"
      headerBorder="#9333ea"
      glowColor="#a855f7"
      icon={Shield}
      iconColor="#c084fc"
      label={data?.label || 'API Gateway'}
      description={data?.description}
      technology={data?.technology}
    />
  )
}

/* ─── ServiceNode ────────────────────────────────────────────────────────── */
export function ServiceNode({ data, selected, targetPosition, sourcePosition }) {
  return (
    <NodeShell
      selected={selected}
      targetPosition={targetPosition}
      sourcePosition={sourcePosition}
      headerBg="#1e3a5f"
      headerBorder="#3b82f6"
      glowColor="#3b82f6"
      icon={Server}
      iconColor="#60a5fa"
      label={data?.label || 'Service'}
      description={data?.description}
      technology={data?.technology}
    />
  )
}

/* ─── DatabaseNode ───────────────────────────────────────────────────────── */
export function DatabaseNode({ data, selected, targetPosition = 'top', sourcePosition = 'bottom' }) {
  return (
    <div
      className="relative min-w-[160px] max-w-[220px] transition-all duration-200 cursor-default animate-fade-in"
      style={{
        filter: selected ? `drop-shadow(0 0 12px #16a34aaa)` : 'none',
      }}
    >
      {/* Dynamic target handle */}
      <Handle
        type="target"
        position={targetPosition}
        style={{
          background: '#16a34a',
          border: '2px solid #0d0d1a',
          width: 10,
          height: 10,
        }}
      />

      <div
        className="overflow-hidden"
        style={{
          background: '#0d1a12',
          border: `1.5px solid ${selected ? '#16a34a' : '#166534'}`,
          borderRadius: '50% 50% 8px 8px / 20px 20px 8px 8px',
          boxShadow: selected
            ? '0 0 0 2px #16a34a40, 0 8px 32px #16a34a22'
            : '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: '#14532d',
            borderBottom: '1px solid #166534',
          }}
        >
          <Database size={14} className="text-[#4ade80]" />
          <span className="text-[#f1f5f9] text-xs font-semibold truncate">
            {data?.label || 'Database'}
          </span>
        </div>
        <div className="px-3 py-2.5">
          {data?.description && (
            <p
              className="text-[#94a3b8] text-[10px] leading-relaxed mb-1.5"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {data.description}
            </p>
          )}
          {data?.technology && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide bg-[#16a34a22] text-[#4ade80] border border-[#16a34a44]">
              {data.technology}
            </span>
          )}
        </div>
      </div>

      {/* Dynamic source handle */}
      <Handle
        type="source"
        position={sourcePosition}
        style={{
          background: '#16a34a',
          border: '2px solid #0d0d1a',
          width: 10,
          height: 10,
        }}
      />
    </div>
  )
}

/* ─── CacheNode ──────────────────────────────────────────────────────────── */
export function CacheNode({ data, selected, targetPosition, sourcePosition }) {
  return (
    <NodeShell
      selected={selected}
      targetPosition={targetPosition}
      sourcePosition={sourcePosition}
      headerBg="#450a0a"
      headerBorder="#dc2626"
      glowColor="#ef4444"
      icon={Zap}
      iconColor="#f87171"
      label={data?.label || 'Cache'}
      description={data?.description}
      technology={data?.technology}
    />
  )
}

/* ─── QueueNode ──────────────────────────────────────────────────────────── */
export function QueueNode({ data, selected, targetPosition, sourcePosition }) {
  return (
    <NodeShell
      selected={selected}
      targetPosition={targetPosition}
      sourcePosition={sourcePosition}
      headerBg="#500724"
      headerBorder="#ec4899"
      glowColor="#f472b6"
      icon={MessageSquare}
      iconColor="#f9a8d4"
      label={data?.label || 'Queue'}
      description={data?.description}
      technology={data?.technology}
    />
  )
}

/* ─── nodeTypes registry ──────────────────────────────────────────────────── */
export const nodeTypes = {
  client: ClientNode,
  cdn: CDNNode,
  lb: LoadBalancerNode,
  gateway: GatewayNode,
  service: ServiceNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: QueueNode,
}

