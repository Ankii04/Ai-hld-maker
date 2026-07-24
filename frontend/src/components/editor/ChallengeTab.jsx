import { Link } from 'react-router-dom'
import { Zap, Lock, RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Overline, TabHeader, Panel, PanelHeader, TabShell } from './Section'

/* ─── Severity badge ─────────────────────────────────────────────────────── */
function SeverityBadge({ severity }) {
  const styles = {
    high:   { bg: '#450a0a', text: '#f87171', border: '#dc262644' },
    medium: { bg: '#422006', text: '#fbbf24', border: '#d9770644' },
    low:    { bg: '#14532d', text: '#4ade80', border: '#16a34a44' },
  }
  const s = styles[severity?.toLowerCase()] || styles.low
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {severity || 'low'}
    </span>
  )
}

/* ─── Issue card ─────────────────────────────────────────────────────────── */
function IssueCard({ title, description, severity, fix, impact, borderColor }) {
  return (
    <div
      className="bg-[#0f0f18] border border-[#2a2a3d] rounded-xl p-5 flex flex-col gap-3"
      style={{ borderLeftColor: borderColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-heading text-sm font-semibold text-[#f1f5f9] leading-snug">{title}</h4>
        <SeverityBadge severity={severity} />
      </div>
      <p className="text-xs text-[#94a3b8] leading-relaxed">{description}</p>
      {fix && (
        <div className="border-t border-[#2a2a3d] pt-2.5">
          <Overline className="mr-1.5">Fix</Overline>
          <span className="text-xs text-[#94a3b8]">{fix}</span>
        </div>
      )}
      {impact && (
        <div className="border-t border-[#2a2a3d] pt-2.5">
          <Overline className="mr-1.5">Impact</Overline>
          <span className="text-xs text-[#94a3b8]">{impact}</span>
        </div>
      )}
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────────────── */
function ChallengeSection({ icon, tone, title, description, items, borderColor, emptyMsg }) {
  return (
    <Panel className="flex flex-col gap-4">
      <PanelHeader
        icon={icon}
        tone={tone}
        title={title}
        description={description}
        actions={
          items.length > 0 ? (
            <span className="text-xs font-medium text-[#94a3b8]">{items.length}</span>
          ) : null
        }
      />
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, i) => (
            <IssueCard key={i} borderColor={borderColor} {...item} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 border border-[#2a2a3d] rounded-xl text-[#64748b] text-[13px] border-dashed">
          {emptyMsg}
        </div>
      )}
    </Panel>
  )
}

/* ─── ChallengeTab ───────────────────────────────────────────────────────── */
export default function ChallengeTab({ design, onChallenge, isChallenging = false, user }) {
  const challenge = design?.challengeMode || design?.challenge
  const isFree = user?.plan === 'free'

  return (
    <TabShell id="challenge-tab" className="relative min-h-[400px]">
      {/* Pro gate overlay */}
      {isFree && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl backdrop-blur-md"
          style={{ background: 'rgba(10,10,15,0.85)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/20 flex items-center justify-center">
            <Lock size={26} className="text-[#a855f7]" />
          </div>
          <div className="text-center">
            <p className="font-heading text-[15px] font-semibold text-[#f1f5f9]">Pro Feature</p>
            <p className="text-[13px] text-[#94a3b8] mt-1">
              Challenge Mode is available on the Pro plan
            </p>
          </div>
          <Link
            to="/upgrade"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white shadow-lg shadow-[#8b5cf6]/30 hover:opacity-90 transition-opacity"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Empty state */}
      {!challenge && !isChallenging && (
        <div className="flex flex-col items-center justify-center gap-5 py-20">
          <div className="w-20 h-20 rounded-3xl bg-[#422006] border border-[#d97706]/30 flex items-center justify-center">
            <Zap size={36} className="text-[#fbbf24]" />
          </div>
          <div className="text-center">
            <h3 className="font-heading text-[15px] font-semibold text-[#f1f5f9]">Challenge Your Architecture</h3>
            <p className="text-[13px] leading-relaxed text-[#94a3b8] mt-2 max-w-sm">
              AI will analyze your design for bottlenecks, single points of failure, and suggest
              improvements.
            </p>
          </div>
          <button
            onClick={onChallenge}
            disabled={!design}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#d97706] to-[#ea580c] text-white shadow-lg shadow-[#d97706]/30 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap size={16} />
            Run Challenge Mode
          </button>
        </div>
      )}

      {/* Loading state */}
      {isChallenging && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#d97706]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#d97706] animate-spin" />
            <div className="absolute inset-3 flex items-center justify-center">
              <Zap size={24} className="text-[#fbbf24]" />
            </div>
          </div>
          <p className="text-[13px] text-[#94a3b8] animate-pulse">
            Analyzing your architecture for weaknesses...
          </p>
        </div>
      )}

      {/* Challenge results */}
      {challenge && !isChallenging && (
        <>
          {/* Header with re-challenge button */}
          <TabHeader
            title="Challenge Report"
            description={`${
              (challenge.bottlenecks?.length || 0) +
              (challenge.spofs?.length || 0) +
              (challenge.recommendations?.length || 0)
            } total findings across bottlenecks, failure points, and recommendations.`}
            actions={
              <button
                onClick={onChallenge}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a28] border border-[#2a2a3d] text-[#94a3b8] hover:border-[#d97706]/60 hover:text-[#d97706] hover:bg-[#d97706]/10 transition-all"
              >
                <RotateCcw size={12} />
                Re-challenge
              </button>
            }
          />

          {/* Bottlenecks */}
          <ChallengeSection
            icon={AlertTriangle}
            tone="#dc2626"
            title="Bottlenecks"
            description="Where load will concentrate first."
            items={challenge.bottlenecks || []}
            borderColor="#dc2626"
            emptyMsg="No bottlenecks detected"
          />

          {/* SPOFs */}
          <ChallengeSection
            icon={ShieldAlert}
            tone="#d97706"
            title="Single Points of Failure"
            description="Components whose failure takes the system down."
            items={challenge.spofs || []}
            borderColor="#d97706"
            emptyMsg="No SPOFs detected"
          />

          {/* Recommendations */}
          <ChallengeSection
            icon={CheckCircle2}
            tone="#16a34a"
            title="Recommendations"
            description="Suggested changes, ordered by the risk they remove."
            items={challenge.recommendations || []}
            borderColor="#16a34a"
            emptyMsg="No additional recommendations"
          />
        </>
      )}
    </TabShell>
  )
}
