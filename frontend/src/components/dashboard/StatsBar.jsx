import { useMemo } from 'react'
import { LayoutDashboard, Calendar, Code2, Crown } from 'lucide-react'

/* ─── Individual stat card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, label, value, sub, accentBg }) {
  return (
    <div className="flex-1 min-w-0 bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accentBg }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-[#f1f5f9] leading-none mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[10px] text-[#4a4a6a] mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

/* ─── StatsBar ────────────────────────────────────────────────────────────── */
export default function StatsBar({ designs = [], user }) {
  const totalDesigns = designs.length

  const thisMonthCount = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return designs.filter((d) => new Date(d.createdAt) >= startOfMonth).length
  }, [designs])

  const mostUsedTech = useMemo(() => {
    const freq = {}
    designs.forEach((d) => {
      const tags = d.techPreferences || d.tags || []
      tags.forEach((t) => {
        freq[t] = (freq[t] || 0) + 1
      })
    })
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || '—'
  }, [designs])

  const isPro = user?.plan === 'pro'

  return (
    <div className="flex gap-4 flex-wrap">
      <StatCard
        icon={LayoutDashboard}
        iconColor="#3b82f6"
        accentBg="rgba(59,130,246,0.12)"
        label="Total Designs"
        value={totalDesigns}
        sub="All time"
      />
      <StatCard
        icon={Calendar}
        iconColor="#8b5cf6"
        accentBg="rgba(139,92,246,0.12)"
        label="This Month"
        value={thisMonthCount}
        sub={isPro ? 'Unlimited' : `${thisMonthCount}/3 free`}
      />
      <StatCard
        icon={Code2}
        iconColor="#06b6d4"
        accentBg="rgba(6,182,212,0.12)"
        label="Most Used Tech"
        value={mostUsedTech}
        sub="Across all designs"
      />

      {/* Plan badge card */}
      <div className="flex-1 min-w-0 bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5 flex items-center gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isPro
              ? 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.2))'
              : 'rgba(139,92,246,0.12)',
          }}
        >
          <Crown
            size={20}
            style={{ color: isPro ? '#fbbf24' : '#a855f7' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Plan</p>
          <p className="text-xl font-bold leading-none mt-0.5" style={{ color: isPro ? '#fbbf24' : '#a855f7' }}>
            {isPro ? 'Pro' : 'Free'}
          </p>
          {!isPro && (
            <a
              href="/upgrade"
              className="text-[10px] text-[#8b5cf6] hover:text-[#a855f7] transition-colors mt-0.5 block"
            >
              Upgrade to Pro →
            </a>
          )}
          {isPro && (
            <p className="text-[10px] text-[#4a4a6a] mt-0.5">All features unlocked</p>
          )}
        </div>
      </div>
    </div>
  )
}
