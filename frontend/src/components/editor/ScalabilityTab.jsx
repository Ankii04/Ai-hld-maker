import { useMemo } from 'react'
import { Users, Zap, Layers, Globe, GitBranch, HardDrive, AlertTriangle, Shield, Eye, AlertCircle, RefreshCw } from 'lucide-react'

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, label, value, sub }) {
  return (
    <div className="flex-1 bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-[#f1f5f9] leading-none">{value}</p>
          {sub && <p className="text-xs text-[#4a4a6a] mt-1">{sub}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}18` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Cache Layer Card ──────────────────────────────────────────────────── */
function CacheLayerCard({ layer, technology, strategy, color }) {
  return (
    <div
      className="flex-1 bg-[#12121a] border border-[#2a2a3d] rounded-xl p-4 min-w-0"
      style={{ borderTopColor: color, borderTopWidth: 2 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: `${color}22`, color }}
        >
          {layer}
        </div>
        <span className="text-xs font-bold text-[#f1f5f9]">{technology}</span>
      </div>
      <p className="text-xs text-[#94a3b8] leading-relaxed">{strategy}</p>
    </div>
  )
}

/* ─── Info Banner ────────────────────────────────────────────────────────── */
function InfoBanner({ icon: Icon, iconColor, title, content }) {
  return (
    <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}18` }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <h3 className="text-sm font-bold text-[#f1f5f9]">{title}</h3>
      </div>
      <p className="text-sm text-[#94a3b8] leading-relaxed ml-11">{content}</p>
    </div>
  )
}

/* ─── Scale Meter ────────────────────────────────────────────────────────── */
const USER_TICKS = [
  { label: '0', value: 0 },
  { label: '1K', value: 1_000 },
  { label: '10K', value: 10_000 },
  { label: '100K', value: 100_000 },
  { label: '1M', value: 1_000_000 },
]

function userCountToPercent(count) {
  const max = 1_000_000
  // logarithmic scale
  if (!count || count <= 0) return 0
  return Math.min((Math.log10(count) / Math.log10(max)) * 100, 100)
}

function parseUserCount(str = '') {
  const s = str.replace(/[^0-9KkMm]/g, '').toUpperCase()
  if (s.includes('M')) return parseFloat(s) * 1_000_000
  if (s.includes('K')) return parseFloat(s) * 1_000
  return parseFloat(s) || 0
}

function ScaleMeter({ estimatedUsers, stressPoints = [] }) {
  const userNum = parseUserCount(estimatedUsers)
  const fillPercent = userCountToPercent(userNum)

  return (
    <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-6">
      <h3 className="text-sm font-bold text-[#f1f5f9] mb-1">Scale Capacity Meter</h3>
      <p className="text-xs text-[#94a3b8] mb-5">
        Your system handles up to{' '}
        <span className="text-[#f1f5f9] font-semibold">{estimatedUsers || 'N/A'}</span> users.
        {stressPoints.length > 0 && " Here's what breaks next:"}
      </p>

      {/* Track */}
      <div className="relative mb-3">
        <div className="w-full h-5 bg-[#1a1a28] border border-[#2a2a3d] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${fillPercent}%`,
              background: `linear-gradient(90deg, #16a34a, #d97706 70%, #dc2626)`,
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
            }}
          />
        </div>

        {/* Stress point markers */}
        {stressPoints.map((sp, i) => {
          const pct = userCountToPercent(parseUserCount(sp.at))
          return (
            <div
              key={i}
              className="absolute top-0 transform -translate-x-1/2"
              style={{ left: `${pct}%` }}
              title={sp.issue}
            >
              <div className="w-0.5 h-5 bg-[#f97316]" />
              <AlertTriangle size={10} className="text-[#f97316] mt-0.5 -ml-1.5" />
            </div>
          )
        })}
      </div>

      {/* Tick labels */}
      <div className="relative flex justify-between px-0 mb-5">
        {USER_TICKS.map(({ label }) => (
          <span key={label} className="text-[10px] text-[#4a4a6a]">
            {label}
          </span>
        ))}
      </div>

      {/* Stress points list */}
      {stressPoints.length > 0 && (
        <div className="space-y-2">
          {stressPoints.map((sp, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#1a1a28] rounded-lg p-3">
              <AlertTriangle size={13} className="text-[#f97316] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[#fbbf24]">At {sp.at}: </span>
                <span className="text-xs text-[#94a3b8]">{sp.issue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── ScalabilityTab ─────────────────────────────────────────────────────── */
export default function ScalabilityTab({ design }) {
  const sc = design?.scalability || {}

  const cacheLayers = sc.cacheLayers || [
    { layer: 'L1', technology: 'In-Memory', strategy: 'Application-level cache with LRU eviction', color: '#3b82f6' },
    { layer: 'L2', technology: 'Redis', strategy: 'Distributed cache with TTL-based expiry', color: '#8b5cf6' },
    { layer: 'L3', technology: 'CDN', strategy: 'Edge caching for static and semi-static content', color: '#06b6d4' },
  ]

  if (!design) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4a4a6a] text-sm p-6">
        Generate a design to see scalability analysis
      </div>
    )
  }

  return (
    <div id="scalability-tab" className="flex flex-col gap-6 p-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={Zap}
          iconColor="#3b82f6"
          label="Estimated RPS"
          value={sc.estimatedRPS || '—'}
          sub="Requests per second"
        />
        <StatCard
          icon={Users}
          iconColor="#8b5cf6"
          label="Estimated Users"
          value={sc.estimatedUsers || '—'}
          sub="Concurrent capacity"
        />
      </div>

      {/* Caching Layers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers size={15} className="text-[#06b6d4]" />
          <h3 className="text-sm font-bold text-[#f1f5f9]">Caching Layers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cacheLayers.map((layer) => (
            <CacheLayerCard key={layer.layer} {...layer} />
          ))}
        </div>
      </div>

      {/* Load Balancing */}
      <InfoBanner
        icon={GitBranch}
        iconColor="#f59e0b"
        title="Load Balancing Strategy"
        content={sc.loadBalancing || 'Round-robin with health checks and session persistence using sticky cookies.'}
      />

      {/* CDN */}
      <InfoBanner
        icon={Globe}
        iconColor="#06b6d4"
        title="CDN Strategy"
        content={sc.cdnStrategy || 'Multi-region CDN with edge nodes. Static assets, media, and public API responses cached at edge locations.'}
      />

      {/* Sharding */}
      <InfoBanner
        icon={HardDrive}
        iconColor="#a855f7"
        title="Sharding Strategy"
        content={sc.shardingStrategy || 'Hash-based horizontal sharding on user_id. Each shard handles roughly equal load with auto-rebalancing.'}
      />

      {/* Scale Meter */}
      <ScaleMeter
        estimatedUsers={sc.estimatedUsers}
        stressPoints={sc.stressPoints || []}
      />

      {/* Failure Handling */}
      {design.failureHandling?.length > 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={15} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f1f5f9] font-heading">Resilience & Failure Handling</h3>
              <p className="text-xs text-[#94a3b8]">Scenarios, circuit breakers, and automatic mitigation policies</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.failureHandling.map((fh, idx) => (
              <div key={idx} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-red-500/20 transition-all duration-200">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-red-400 font-heading">
                    {fh.scenario}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider font-mono">
                    {fh.strategy}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-2 font-sans">
                  <strong className="text-[#e2e8f0]">Mitigation:</strong> {fh.mitigation}
                </p>
                {fh.details && (
                  <p className="text-[11px] text-[#4a4a6a] leading-relaxed bg-[#12121a] p-2 rounded border border-[#2a2a3d]/50 font-mono">
                    {fh.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      {design.security?.length > 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Shield size={15} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f1f5f9] font-heading">Security & Threat Controls</h3>
              <p className="text-xs text-[#94a3b8]">Threat modeling, network isolation, and encryption configurations</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.security.map((sec, idx) => (
              <div key={idx} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-green-500/20 transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-green-400 font-heading">
                    {sec.threat}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed mb-2 font-sans">
                  <strong className="text-[#e2e8f0]">Control measure:</strong> {sec.control}
                </p>
                {sec.implementation && (
                  <div className="text-[11px] text-[#94a3b8] bg-[#12121a] p-2 rounded border border-green-500/10 font-sans leading-relaxed">
                    <strong className="text-green-400 font-mono">Implementation:</strong> {sec.implementation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observability */}
      {design.observability?.length > 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Eye size={15} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f1f5f9] font-heading">Observability & Telemetry</h3>
              <p className="text-xs text-[#94a3b8]">Metrics collection, logging infrastructure, and alerting runbooks</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.observability.map((obs, idx) => (
              <div key={idx} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-blue-500/20 transition-all duration-200">
                <div className="border-b border-[#2a2a3d] pb-2 mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f1f5f9] font-mono">
                    Tier: {obs.component}
                  </span>
                  <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    TELEMETRY
                  </span>
                </div>
                
                {obs.metrics?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-[#4a4a6a] uppercase tracking-wider">Key Metrics:</span>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {obs.metrics.map((m, mIdx) => (
                        <span key={mIdx} className="text-[10px] bg-[#12121a] border border-[#2a2a3d] px-2 py-0.5 rounded text-[#94a3b8] font-mono">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {obs.logging && (
                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-2 font-sans">
                    <strong className="text-[#e2e8f0]">Logging Policy:</strong> {obs.logging}
                  </p>
                )}

                {obs.alerts?.length > 0 && (
                  <div className="bg-[#12121a] border border-[#2a2a3d]/50 p-2.5 rounded-lg">
                    <span className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider block mb-1">Trigger Alerts:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      {obs.alerts.map((a, aIdx) => (
                        <li key={aIdx} className="text-[11px] text-[#94a3b8] leading-relaxed">{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
