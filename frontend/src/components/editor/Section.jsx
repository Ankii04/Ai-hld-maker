/**
 * Shared layout primitives for editor tab content.
 *
 * Before this existed every tab invented its own section treatment — three
 * different h2 sizes, h3 in bold/semibold/uppercase-xs at random, panel
 * padding drifting between p-4/p-5/p-6. Tabs should compose these instead of
 * hand-rolling headings and card shells, so the editor reads as one product.
 *
 * Type scale used here (matches the dashboard/landing pass):
 *   tab title    17px semibold        section title 14px semibold
 *   body         13px                 overline      11px uppercase, +0.08em
 * Nothing drops below 11px, and #4a4a6a is never used for text — it fails
 * contrast on #12121a.
 */

/* ── Uppercase micro-label ─────────────────────────────────── */
export function Overline({ children, className = '' }) {
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] ${className}`}
    >
      {children}
    </span>
  )
}

/* ── Tab-level header: the one h2 per tab ──────────────────── */
export function TabHeader({ title, description, actions, className = '' }) {
  return (
    <header className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="font-heading text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#f1f5f9]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-[#94a3b8]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  )
}

/* ── Card shell ────────────────────────────────────────────── */
export function Panel({ children, className = '', padded = true, ...rest }) {
  return (
    <section
      className={`bg-[#12121a] border border-[#2a2a3d] rounded-xl ${padded ? 'p-4 sm:p-5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </section>
  )
}

/* ── Section header inside a Panel: icon chip + title + hint ─ */
export function PanelHeader({ icon: Icon, tone = '#3b82f6', title, description, actions, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon && (
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
            style={{ background: `${tone}14`, borderColor: `${tone}33` }}
            aria-hidden="true"
          >
            <Icon size={15} style={{ color: tone }} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-heading text-[14px] font-semibold leading-snug text-[#f1f5f9]">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#94a3b8]">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}

/* ── Consistent vertical rhythm wrapper for a whole tab ────── */
export function TabShell({ id, children, className = '', width = 'wide' }) {
  const max = width === 'narrow' ? 'max-w-4xl' : 'max-w-6xl'
  return (
    <div id={id} className={`${max} mx-auto w-full p-4 sm:p-6 flex flex-col gap-5 ${className}`}>
      {children}
    </div>
  )
}

/* ── Empty / not-generated state ───────────────────────────── */
export function TabEmpty({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <span className="w-12 h-12 rounded-xl bg-[#12121a] border border-[#2a2a3d] flex items-center justify-center mb-4">
          <Icon size={20} className="text-[#64748b]" aria-hidden="true" />
        </span>
      )}
      <h3 className="font-heading text-[15px] font-semibold text-[#f1f5f9]">{title}</h3>
      {description && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#94a3b8] max-w-sm">{description}</p>
      )}
    </div>
  )
}
