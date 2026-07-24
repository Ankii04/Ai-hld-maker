import { Users, Zap, Layers, Globe, GitBranch, HardDrive, AlertTriangle, Shield, Eye, AlertCircle, Gauge } from 'lucide-react'
import { Overline, TabHeader, Panel, PanelHeader, TabShell, TabEmpty } from './Section'

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, label, value, sub }) {
  return (
    <Panel className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Overline className="block mb-1">{label}</Overline>
          <p className="text-2xl font-bold text-[#f1f5f9] leading-none">{value}</p>
          {sub && <p className="text-[12px] text-[#94a3b8] mt-1">{sub}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}18` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
    </Panel>
  )
}

/* ─── Cache Layer Card ──────────────────────────────────────────────────── */
function CacheLayerCard({ layer, technology, strategy, color }) {
  return (
    <Panel
      className="flex-1 min-w-0"
      style={{ borderTopColor: color, borderTopWidth: 2 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{ background: `${color}22`, color }}
        >
          {layer}
        </div>
        <span className="font-heading text-[14px] font-semibold text-[#f1f5f9]">{technology}</span>
      </div>
      <p className="text-[12px] text-[#94a3b8] leading-relaxed">{strategy}</p>
    </Panel>
  )
}

/* ─── Info Banner ────────────────────────────────────────────────────────── */
function InfoBanner({ icon: Icon, iconColor, title, content }) {
  return (
    <Panel className="flex flex-col gap-3">
      <PanelHeader icon={Icon} tone={iconColor} title={title} />
      <p className="text-[13px] text-[#94a3b8] leading-relaxed ml-[42px]">{content}</p>
    </Panel>
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
    <Panel className="flex flex-col gap-4">
      <PanelHeader
        icon={Gauge}
        tone="#3b82f6"
        title="Scale Capacity Meter"
        description={
          <>
            Your system handles up to{' '}
            <span className="text-[#f1f5f9] font-semibold">{estimatedUsers || 'N/A'}</span> users.
            {stressPoints.length > 0 && " Here's what breaks next:"}
          </>
        }
      />

      <div className="flex flex-col gap-3">
        {/* Track */}
        <div className="relative">
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
        <div className="relative flex justify-between px-0">
          {USER_TICKS.map(({ label }) => (
            <span key={label} className="text-[11px] text-[#64748b]">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Stress points list */}
      {stressPoints.length > 0 && (
        <div className="flex flex-col gap-3">
          {stressPoints.map((sp, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#1a1a28] rounded-lg p-3">
              <AlertTriangle size={13} className="text-[#f97316] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[12px] font-semibold text-[#fbbf24]">At {sp.at}: </span>
                <span className="text-[12px] text-[#94a3b8]">{sp.issue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
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
      <TabEmpty
        icon={Gauge}
        title="No scalability analysis yet"
        description="Generate a design to see scalability analysis"
      />
    )
  }

  return (
    <TabShell id="scalability-tab">
      <TabHeader
        title="Scalability & Resilience"
        description="Capacity estimates, caching, traffic distribution, and failure posture"
      />

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
      <div className="flex flex-col gap-4">
        <PanelHeader
          icon={Layers}
          tone="#06b6d4"
          title="Caching Layers"
          description="Tiered cache strategy from application memory out to the edge"
        />
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
        <Panel className="flex flex-col gap-4">
          <PanelHeader
            icon={AlertCircle}
            tone="#f87171"
            title="Resilience & Failure Handling"
            description="Scenarios, circuit breakers, and automatic mitigation policies"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.failureHandling.map((fh, idx) => (
              <div key={idx} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-red-500/20 transition-all duration-200">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[13px] font-bold text-red-400 font-heading">
                    {fh.scenario}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider font-mono">
                    {fh.strategy}
                  </span>
                </div>
                <p className="text-[12px] text-[#94a3b8] leading-relaxed mb-2 font-sans">
                  <strong className="text-[#e2e8f0]">Mitigation:</strong> {fh.mitigation}
                </p>
                {fh.details && (
                  <p className="text-[12px] text-[#94a3b8] leading-relaxed bg-[#12121a] p-2 rounded border border-[#2a2a3d]/50 font-mono">
                    {fh.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Security */}
      {design.security?.length > 0 && (
        <Panel className="flex flex-col gap-4">
          <PanelHeader
            icon={Shield}
            tone="#4ade80"
            title="Security & Threat Controls"
            description="Threat modeling, network isolation, and encryption configurations"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.security.map((sec, idx) => (
              <div key={idx} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-green-500/20 transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-bold text-green-400 font-heading">
                    {sec.threat}
                  </span>
                </div>
                <p className="text-[12px] text-[#94a3b8] leading-relaxed mb-2 font-sans">
                  <strong className="text-[#e2e8f0]">Control measure:</strong> {sec.control}
                </p>
                {sec.implementation && (
                  <div className="text-[12px] text-[#94a3b8] bg-[#12121a] p-2 rounded border border-green-500/10 font-sans leading-relaxed">
                    <strong className="text-green-400 font-mono">Implementation:</strong> {sec.implementation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Observability */}
      {design.observability?.length > 0 && (
        <Panel className="flex flex-col gap-4">
          <PanelHeader
            icon={Eye}
            tone="#60a5fa"
            title="Observability & Telemetry"
            description="Metrics collection, logging infrastructure, and alerting runbooks"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {design.observability.map((obs, idx) => (
              <div key={idx} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-blue-500/20 transition-all duration-200">
                <div className="border-b border-[#2a2a3d] pb-2 mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#f1f5f9] font-mono">
                    Tier: {obs.component}
                  </span>
                  <span className="text-[11px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    TELEMETRY
                  </span>
                </div>

                {obs.metrics?.length > 0 && (
                  <div className="mb-2">
                    <Overline>Key Metrics:</Overline>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {obs.metrics.map((m, mIdx) => (
                        <span key={mIdx} className="text-[11px] bg-[#12121a] border border-[#2a2a3d] px-2 py-0.5 rounded text-[#94a3b8] font-mono">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {obs.logging && (
                  <p className="text-[12px] text-[#94a3b8] leading-relaxed mb-2 font-sans">
                    <strong className="text-[#e2e8f0]">Logging Policy:</strong> {obs.logging}
                  </p>
                )}

                {obs.alerts?.length > 0 && (
                  <div className="bg-[#12121a] border border-[#2a2a3d]/50 p-2.5 rounded-lg">
                    <Overline className="block mb-1 !text-[#f59e0b]">Trigger Alerts:</Overline>
                    <ul className="list-disc pl-4 space-y-1">
                      {obs.alerts.map((a, aIdx) => (
                        <li key={aIdx} className="text-[12px] text-[#94a3b8] leading-relaxed">{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </TabShell>
  )
}
