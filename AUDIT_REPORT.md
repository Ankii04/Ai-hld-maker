# ArchMind — Enterprise Product, UI/UX & Engineering Audit

**Audited:** 2026-07-19 · Full source read (frontend + backend) + live browser walkthrough of every page, tab, and state, including one real end-to-end AI generation.
**Rule respected:** no project files were modified. This report is the only new file.

---

# 1. Executive Summary

ArchMind has a genuinely strong idea and an unusually rich feature surface for a solo-built product: AI blueprint generation across 5+ dimensions, an interactive HLD whiteboard, a live traffic simulator with chaos engineering, version history, templates, and public sharing. The dark visual language is consistent and, at first glance, the product photographs well — the HLD diagram, ER diagram, and Sandbox all look like screenshots from a funded startup.

The problem is that **the product looks premium but does not behave premium.** Everywhere a user touches it deeply, trust breaks:

- The **Canvas tab silently destroys all work when you switch tabs** (reproduced live). For a product whose stated killer feature is the canvas, this is fatal.
- The **entire monetization funnel is a dead end** — every "Upgrade to Pro" path leads to a 404 or a button with no click handler, and the upsell modal that should appear on gated actions never fires because the frontend checks the wrong field for the error code.
- The **editor ships 5.0 MB of JavaScript in a single chunk** (measured from your own `dist/`), mostly because the entire `react-icons/si` icon library (~3,000 SVGs) is star-imported for a 50-icon search panel.
- The **AI generates a full UI/UX blueprint (screens, user flows, design system) on every generation — and the app never displays any of it.** You pay Gemini for tokens whose output no user can ever see.
- Generation progress is a **fake looping timer** that restarts from the top when generation exceeds ~32 s (yours took ~70 s live), and when generation finishes there is **no success feedback and no navigation to the result**.
- **Live credentials sit in `backend/.env`** (Atlas connection string with password, Gemini API key, guessable JWT secret) alongside a hardcoded personal email that silently gets a free Pro plan in three places in the backend.

None of this is fatal to the vision. The bones — data model, AI pipeline with JSON repair, React Flow foundation, tab architecture — are sound. The gap between "impressive demo" and "Linear-grade product" is a finite, rankable list of defects and missing polish, which this report enumerates completely.

### Scores

| Dimension | Score /100 | Rationale |
|---|---|---|
| **UI (visual)** | 62 | Consistent dark theme, good node/diagram styling; but hardcoded hex soup, micro-text (8–10px) everywhere, contrast failures, cramped header, overlapping edge labels |
| **UX (flows)** | 46 | Core generation flow works, but no result reveal, fake progress, dead upgrade paths, destructive silent data loss, confirm() dialogs, no onboarding |
| **Performance** | 34 | 5.0 MB editor chunk, 984 KB scalability chunk, no icon tree-shaking, JSON.stringify in render deps, 200 ms full-graph re-render loop in Sandbox |
| **Accessibility** | 30 | `focus:outline-none` rampant with no replacement, icon buttons unlabeled, #4a4a6a-on-#12121a text (~2.7:1) fails WCAG, no reduced-motion, tablist without keyboard nav, aria-controls points to non-existent IDs |
| **Features (depth vs promise)** | 55 | Sandbox and generation are real; Canvas is a hollow shell (no rename, no persistence, no shortcuts), Starred filter has no star action, uiux output invisible |
| **Design maturity** | 45 | Tokens exist but are bypassed by literal hex classes in ~40 files; two duplicate sources of truth (tailwind.config + index.css) |
| **Product readiness** | 40 | Not shippable as paid SaaS today: payment dead-ends, security gaps, canvas data loss |
| **OVERALL** | **47 / 100** | Excellent demo, pre-alpha product behavior |

---

# 2. Top 20 Problems (ranked by user damage)

| # | Severity | Problem | Where |
|---|---|---|---|
| 1 | 🔴 Critical | Canvas work is silently erased on tab switch — state never loads from or saves to the design (`design` prop is ignored) | `CanvasTab.jsx` (reproduced live) |
| 2 | 🔴 Critical | All payment paths are dead: `/upgrade` route 404s (linked from StatsBar + ChallengeTab), UpgradeModal's pay button has **no onClick** | `Editor.jsx:97`, `StatsBar.jsx:96`, `ChallengeTab.jsx:103` |
| 3 | 🔴 Critical | Upsell modal never triggers on gated actions: backend sends code in `error` field, frontend greps `err.message` for `'UPGRADE_REQUIRED'`; free-limit code `MONTHLY_LIMIT_REACHED` is handled nowhere | `Editor.jsx:346`, `designs.js:236`, `auth.js (middleware):92` — reproduced live: Share shows dead-end toast |
| 4 | 🔴 Critical | Secrets in `backend/.env`: Atlas URI with username/password, Gemini API key, weak JWT secret. Rotate all three if this folder was ever pushed anywhere | `backend/.env` |
| 5 | 🔴 Critical | Hardcoded backdoor: a specific personal email is granted Pro at runtime in 3 places | `routes/auth.js:117,165,198`, `middleware/auth.js:63` |
| 6 | 🔴 Critical | Editor ships a **5.0 MB JS chunk** (`Editor-*.js`), plus 984 KB `ScalabilityTab-*.js` — full `react-icons/si` import, dagre, html2pdf all eagerly bundled | measured in `frontend/dist/assets` |
| 7 | 🔴 Critical | Version rollback destroys current work: design fields are overwritten **before** the "safety snapshot" is taken, so the snapshot saves the already-rolled-back state — the confirm dialog explicitly promises the opposite | `routes/designs.js:598-623` |
| 8 | 🟠 High | Every Save unmounts the whole editor: `updateDesign` flips global `isLoading`, and the editor body renders `<LoadingScreen/>` when `isLoading` — all React Flow instances, tab state, and undo history are destroyed on each save (incl. title blur) | `designStore.js:102`, `Editor.jsx:550` |
| 9 | 🟠 High | AI-generated `uiux` blueprint (screens, flows, design system) is stored but **never rendered anywhere** — dead tokens, dead backend route (`/uiux/generate-mockup`), dead component (`UserFlowDiagram.jsx`) | schema + `designStore.generateUiMockup` (unused) |
| 10 | 🟠 High | Generation progress is a fake 3.2 s looping timer; two different step lists (6 in panel, 10 in store) share one index; steps visibly restart when generation >32 s (live: ~70 s) | `designStore.js:37`, `RequirementsPanel.jsx:18` |
| 11 | 🟠 High | After generation completes: no toast, no navigation, no reveal — user is left sitting on whatever tab they had open (live: stayed on History) | `Editor.jsx` / `designStore.generateDesign` |
| 12 | 🟠 High | CORS allows **any** `*.vercel.app` origin with credentials — any stranger can deploy a site on Vercel and call your API from users' browsers | `server.js:39` |
| 13 | 🟠 High | No rate limiting anywhere: login/signup brute-forceable; `/generate` can be hammered to drain your Gemini quota (free-plan check also has a read-then-write race allowing parallel over-generation) | `server.js`, `routes/designs.js:229` |
| 14 | 🟠 High | Edges can never be clicked in any diagram — `.react-flow__edges g { pointer-events: none !important }` kills edge selection, so the Canvas "Edge Properties" panel is unreachable dead UI | `index.css:862`, `CanvasProperties.jsx` |
| 15 | 🟠 High | Pro gating is incoherent: TabBar's PDF button is **ungated** while the Export dropdown gates the same action as Pro; JSON export is free client-side while the backend `/export` route requires Pro; Challenge gate is a client-side blur with data underneath | `TabBar.jsx:54`, `Editor.jsx:114`, `ChallengeTab.jsx:89` |
| 16 | 🟠 High | Public "read-only" share isn't read-only: `PublicShare` renders `HLDTab` without `readOnly`, so visitors can drag nodes and open the edit drawer | `PublicShare.jsx:53` |
| 17 | 🟠 High | Sandbox simulation math is wrong: the 5-iteration propagation loop **accumulates** RPS into targets without resetting, so downstream nodes see ~5× traffic — DB shows CRITICAL + 16% error at the default 500 RPS "Normal Baseline" (live), teaching users false conclusions | `SandboxTab.jsx:845-895` |
| 18 | 🟡 Medium | "Starred" filter exists but nothing can ever be starred — no star button, no backend field; filter is permanently empty | `Dashboard.jsx:542`, `DesignCard.jsx`, `models/Design.js` |
| 19 | 🟡 Medium | Trust-eroding fake copy: "Our team has been notified" (no telemetry), Settings toggles that persist nothing yet toast "enabled", model picker offering "Gemini 1.5" while backend runs 2.5-flash, "Join thousands of engineers", README pricing ($9.99/10 designs) vs landing ($19/3 designs) | `ErrorBoundary.jsx:63`, `Dashboard.jsx:445-516`, `Landing.jsx:626` |
| 20 | 🟡 Medium | Accessibility net: focus rings suppressed globally, unlabeled icon buttons, 8–10px text, `#4a4a6a` labels below 3:1 contrast, no `prefers-reduced-motion`, `window.confirm` for destructive ops, `aria-controls="hld-panel"` targets that don't exist | global |

---

# 3. Top 20 Quick Wins (≤ ~1 hour each, high ROI)

1. **Persist canvas**: serialize CanvasTab nodes/edges into `design.canvas` on change (add one Mixed field to the schema) and hydrate on mount. Kills problem #1's data loss even before the full canvas rework.
2. **Fix upsell detection**: check `err.data?.error === 'UPGRADE_REQUIRED' || err.data?.error === 'MONTHLY_LIMIT_REACHED'` (the api interceptor already forwards `data`).
3. **Wire the UpgradeModal button** to a real route (even a "Payments coming soon — get Pro free during beta" email capture beats a dead button), and add an `/upgrade` route or point all links at the modal.
4. **Split `isSaving` from `isLoading`** in designStore (`updateDesign` should not toggle the flag that unmounts the editor).
5. **Icon import diet**: replace both `import * as SiIcons from 'react-icons/si'` with a generated map of the 50 curated icons (`import { SiReact, ... }`); lazy-load the full set only when the search panel is opened. This alone should cut the editor chunk by ~3–4 MB.
6. **Lazy-load html2pdf** (`await import('html2pdf.js')` inside `exportTabAsPDF`) and dagre where possible.
7. **After generation**: `setActiveTab('hld')` + success toast + confetti-free but visible "Blueprint ready" moment.
8. **Honest progress**: replace the looping fake steps with a single indeterminate state + elapsed timer + one honest sentence ("Gemini is drafting ~15k tokens of architecture; typically 45–90 s"). Clamp the step index so it never wraps.
9. **Remove `pointer-events: none !important` on `.react-flow__edges g`** and delete the whole "DOM Layout Guarantee" override block; let React Flow manage its own DOM. Edge selection starts working everywhere.
10. **Rollback fix**: snapshot current state **before** applying the rollback (move the `Version.create` above the field overwrites in `designs.js`).
11. **Gate or un-gate PDF consistently** — pick one (recommend: PDF free, watermarked; clean PDF Pro) and enforce in one place.
12. **`readOnly` for share pages**: pass `readOnly` down from `PublicShare` to `HLDTab`/`ArchitectureDiagram`.
13. **Fix Sandbox flow math**: reset `flowRPS` each iteration (compute into a `nextFlow` map), or run a single topological pass. The default preset should look healthy.
14. **Delete or hide fake UI**: Settings toggles, model preference picker, "team has been notified", "Join thousands" — replace with honest equivalents.
15. **Remove the Pro backdoor email** and drive plan from the DB only (set your own user's plan to `pro` in Mongo once).
16. **Restrict CORS**: exact-match allowlist (`FRONTEND_URL`), drop the `\.vercel\.app$` wildcard; add `express-rate-limit` on `/api/auth/*` and `/api/designs/:id/generate`.
17. **Escape hatch on 404 catch-all**: `path="*"` currently redirects to `/404` losing the URL; render NotFound in place so Back works and the URL is inspectable.
18. **Pluralization + copy sweep**: "1 endpoints", "client client" (Sandbox walkthrough), "Architectural" consistency, en-dash mismatch in Expected Users options (template `100K - 1M` never matches option `1K–100K`).
19. **Toast placement**: `bottom-right` — top-right toasts cover Save/Export/Share (seen live).
20. **Repo hygiene**: remove `backend/data/` (a full MongoDB data directory incl. 200 MB of journal files), `view_design.js`, `practice100.js`, `arraymethods.md`; add `AUDIT_REPORT.md` + `.env` to `.gitignore`.

---

# 4. Detailed Audit

## 4.1 UI Audit (Section 1)

### Typography
- **Pairing (Space Grotesk / Inter / JetBrains Mono) is good** — a legitimately nice, techy stack. Keep it.
- **Micro-text epidemic**: dozens of `text-[8px]`, `text-[9px]`, `text-[10px]` instances (Sandbox metrics, badges, node bodies, walkthrough tooltip at 7px!). Linear's floor is effectively 12px with tightened tracking. Anything below 10px is decoration, not text. *Severity: High. Impact: strain, perceived "toy density" instead of "pro density".*
- **No type scale exists.** Sizes are ad hoc per file. Define a 7-step scale (12/13/14/16/20/24/32) as Tailwind theme tokens and forbid arbitrary values.
- Uppercase+tracking labels are used at 4+ different size/weight combos — standardize one "overline" style.

### Color & contrast
- Palette hues are fine (blue/purple on near-black), but **the same 10 hexes are hand-typed in ~40 files** (`#94a3b8`, `#2a2a3d`, `#12121a`...). One rebrand = 400 edits. *This is the single biggest design-system defect.*
- **Contrast failures (WCAG AA)**: `#4a4a6a` on `#12121a` ≈ 2.7:1 used for labels ("Chaos Console", stat sublabels, placeholders `#4a5568`); `#94a3b8` at 10px fails the large-text exemption. Badge text on 15%-alpha fills hovers near 3:1.
- Six accent colors (blue, purple, cyan, green, amber, red) are used **decoratively without semantics** — green means "database" in one place, "success" in another, "GET" in a third. Define semantic roles: brand=blue→purple, success, warning, danger, info; node-type colors become a separate categorical ramp.

### Spacing, alignment, grid
- Spacing is Tailwind-default but inconsistently applied: cards use p-4, p-5, p-6 interchangeably in sibling components (StatCard p-5, InfoCard p-4, IssueCard p-5).
- Editor header is cramped: back button, hamburger, logo, divider, title (truncated at `max-w-[100px]` on mobile — "3-Tier SaaS Web App P…" at desktop 800px), save-status crams against the title ("…P**…Saved**" seen live). Needs a real 3-zone header grid with min-widths.
- At ~800–1023px the Requirements sidebar becomes an overlay, but the History tab content clipped off the left viewport edge (seen live) — horizontal overflow leak.

### Components inventory (state per component)
- **Buttons**: 4+ visually distinct primary styles (gradient rounded-xl, gradient rounded-lg, solid blue-600, green START SIM). No single Button component exists — every button is a bespoke className string. Same for inputs, badges, cards. **This is why consistency drifts.**
- **Inputs**: focus treatment differs per page (blue ring on Login, purple on Signup, ring-1 in RequirementsPanel vs ring-2 elsewhere).
- **Dropdowns** (UserMenu, filter, export, expected-users): all custom, none support keyboard (no arrow keys, no Esc except modal, no typeahead, no focus trap). Adopt Radix/HeadlessUI primitives styled to your theme.
- **Modals**: no focus trap, no Esc-close on NewDesignModal backdrop (Esc works only while the title input is focused), background scroll not locked.
- **Empty states**: Dashboard's is good. Canvas has none (blank void with cryptic left toolbar — no "add your first shape or press R" hint). Editor-without-design state is decent.
- **Error states**: Auth pages good (inline banner). Editor generation failure = raw toast of backend message. DesignCard has a "Failed/Retry" state — nice touch, keep.
- **Loading states**: PageLoader (spinner) for routes; skeletons only on Dashboard. Editor tabs have zero skeletons — the generated-HLD reveal flashed an empty diagram with floating edges for ~1 s (seen live) before nodes appeared. Add a diagram skeleton and only fade in after `fitView`.
- **Tables**: none (Database tab uses node cards — fine).
- **Tooltips**: `title=""` attributes only — native browser tooltips at 700 ms look cheap in a dark app. One styled Tooltip primitive.
- **Icons**: lucide (good, consistent) + react-icons/si (bundle bomb, see §4.8).
- **Breadcrumbs/pagination**: none needed yet; designs list is capped at 50 silently — add pagination or "load more" before users hit it.

### Per-page visual notes
- **Landing**: hero is solid. Two "See Demo" issues: it's a lie (goes to /signup) and there is no demo. The "Technical Reference" section is **internal engineering documentation on a marketing page** (explains your vercel.json rewrites to prospects) — move to a real /docs or delete. Footer is nearly empty (one column with 2 links) — either flesh out or simplify to a single-row footer. "MOST POPULAR" badge on a 2-option pricing table is filler.
- **Auth pages**: best pages in the app. The left panel's `animate-pulse` on all 6 floating nodes reads as "loading forever" — use subtle float instead of opacity pulse.
- **Dashboard**: solid layout. Title hover gradient effect on cards is a nice touch. Cards lack a preview thumbnail of the diagram — the single highest-value visual upgrade here (render node-graph minimap SVG server-side or from stored positions).
- **Editor**: the HLD diagram styling (colored headers per node type, tech pill, DB cylinder shape) is genuinely good. Edge labels overlap into an unreadable band when >8 edges (seen live on generated design) — labels need collision avoidance, background chips, or hover-only reveal.
- **404**: good-looking; keep (fix the routing catch-all, §3.17).

## 4.2 UX Audit (Section 2)

- **First impression (new user)**: signup → empty dashboard → "Create First Design" → modal → editor. Decent skeleton of a funnel, but the editor drops you on an empty HLD tab with a collapsed sidebar at <1024px — **nothing tells you the sidebar is where generation happens.** First-run should open the sidebar, focus Requirements, and point at Generate.
- **Onboarding**: none. No product tour, no sample design pre-seeded, no template preview before committing. Minimum: seed every new account with one pre-generated example design ("Example: Ride-sharing app") so the first dashboard is never empty and every tab has content to explore.
- **The generation moment — your one "magic" moment — is squandered**: fake steps loop (users notice; it destroys trust in everything else), a 6-s-delayed cold-start toast fires even locally, completion is silent, and the result isn't revealed. This is the #1 UX flow to rebuild (see §4.10).
- **Discoverability**: Canvas/Sandbox/Challenge are just tab labels with emoji. No feature ever explains itself. Emoji-in-tabs (🎨🧪🔥🕒) reads hobbyist — replace with lucide icons.
- **Cognitive load**: 9 tabs is at the limit. Group: **Design** (HLD/LLD/DB/APIs/Scalability as sub-nav or vertical sections), **Canvas**, **Simulate** (Sandbox), **Review** (Challenge), **History**.
- **Keyboard**: only Ctrl+S. No command palette, no tab cycling, no canvas shortcuts, no `?` help. For your Linear-tier ambition this is table stakes (see §5 roadmap).
- **Microcopy**: mixed register — "Architectural Commit Savepoint" vs "Whiteboard" vs "Blueprint" vs "Design" all name the same thing. Pick "Design" (object) + "Snapshot" (version). Kill jargon like "Requirement Compiling".
- **Errors users will actually hit**: free limit reached → raw toast, no path forward (should be the upsell modal with usage meter); expired JWT mid-session → every action fails with toasts, no redirect to login (add a 401 response interceptor).
- **Trust signals**: fabricated ones present (thousands of engineers, team notified) and real ones absent (no terms/privacy pages despite the signup sentence linking nowhere, no security page, no changelog). Invert that.
- **Why users leave (predicted)**: (1) canvas eats their work once → never returns; (2) first generation feels broken during the 70 s of looping fake steps → abandon; (3) hits any Pro gate, tries to pay, finds a 404 → concludes the product is abandoned.

## 4.3 Functionality / QA Audit (Section 3)

Reproduced live unless marked (code): 

**Critical**
- C1. Canvas data loss on tab switch (live). Also: no persistence at all even via Save.
- C2. `/upgrade` 404 from dashboard + challenge gate (live). UpgradeModal button no-op (code).
- C3. Share on free plan → toast dead end, modal never opens (live). Generate-limit error unhandled (code).
- C4. Rollback commits the wrong snapshot (code, `designs.js:598`), directly contradicting its own confirm dialog.

**High**
- H1. Save unmounts the entire editor via global `isLoading` (code; flash observable). Also History `commitVersion` flips the same flag.
- H2. Editor tab state resets on every save/tab-switch — combined with H1, undo history is unreliable everywhere.
- H3. Sandbox: RPS multiplication bug (live: DB critical @ 500 RPS); the `useEffect` interval is torn down/recreated every 200 ms tick because `currentRPS`, `nodes`, `edges` are deps; auto-scaling `setServiceInstances` fires inside the compute map (state write during another state's derivation); latency formula `queueDelay = excess>0 ? 1000/excess : 2000` produces 2 s cliffs and 193 ms at baseline (live).
- H4. Edge click/selection dead in all flows (CSS `!important`, code) — Canvas edge-properties UI unreachable.
- H5. Public share editable (code); also shared page fetches `res.data` fine but renders `HLDTab` with editor styling including PDF ids.
- H6. Generation: two-step-list mismatch, wrap-around (live), cold-start toast on localhost, no cancel button during a 300 s window, double-submit protected only by disabled state.
- H7. Free-plan limit race: `checkMonthlyLimit` read-then-check, `$inc` after generation — two parallel requests both pass (code). Use an atomic conditional update.
- H8. Undo history in CanvasTab: `pushState` slices at 50 with `shift()` but pointer math (`Math.min(prev+1, 49)`) desynchronizes pointer vs array after overflow (code). Also edge deletions/moves never push history.

**Medium**
- M1. Starred filter with no star mechanism (code+live).
- M2. Dashboard delete: `window.confirm`, then whole grid re-skeletons (global isLoading).
- M3. `ArchitectureDiagram` `useEffect` keyed on `JSON.stringify(propNodes)` — O(n) stringify every render, and node drags round-trip through the store re-triggering conversion; `hasOverlaps` is O(n²) per prop change.
- M4. Single-click on any HLD node opens the edit drawer — you cannot select/move without opening it; should be double-click or explicit Edit affordance.
- M5. Editor PDF button exports whatever tab is active including History (`history-tab` id) → nonsense PDFs; dark-background PDFs print terribly (html2canvas of a dark UI).
- M6. `NewDesignModal`: Enter in title creates even with template selected mid-edit; no error surface if create fails (only store error); template constraint values (`'Enterprise Scale'`, `'100K - 1M'`) don't match the RequirementsPanel option sets, so pill states silently show nothing selected (live).
- M7. Auth: frontend min password 8, backend 6; strength meter order-of-checks bug (10+ chars without digits rates "Fair" while 9 chars with everything rates "Weak"); no forgot-password; no email verification.
- M8. `api.js` has no 401 handler → expired sessions degrade into toast storms.
- M9. Toaster overlaps header actions (live).
- M10. README/API docs drift: documents `/api/auth/register`, `/logout`, `/api/generate/*` endpoints that don't exist; two different pricing tables.

**Low**
- L1. "1 endpoints" (live), "client client", "Standing by: The backend server is waking up" phrasing, emoji in log lines.
- L2. `nodeIdCounter` module global for node ids — collides after HMR or across designs in one session (code).
- L3. `formatDistanceToNow` without suppressHydration concerns — fine, but timestamps don't live-update.
- L4. `index.html` references `/favicon.svg` — ensure the file exists in `public/` (repo copy not verified).
- L5. Repo litter: `backend/data/` MongoDB files (~200 MB journals), `view_design.js`, root `practice100.js`, `arraymethods.md`.

**Security (compact)**
- S1. Secrets in `.env` (see Top 20 #4) + weak JWT secret.
- S2. CORS wildcard `*.vercel.app` with credentials.
- S3. No rate limiting (auth brute force; Gemini cost abuse).
- S4. Pro backdoor email ×3.
- S5. JWT in localStorage (XSS-exfiltratable); acceptable near-term but plan httpOnly cookies.
- S6. `POST /api/designs` accepts arbitrary `hld/lld/...` Mixed payloads up to 10 MB from any authenticated user — storage abuse vector; validate shape/size.
- S7. Helmet is on (good); no `express-mongo-sanitize` (Mongoose 8 mitigates most operator injection, still cheap to add).

## 4.4 Premium UI Improvements (Section 4)

What separates ArchMind's current UI from Linear/Vercel-grade, concretely:

1. **One Button/Input/Card/Badge/Modal primitive set** (shadcn/ui pattern — you already list it in the README but don't use it). Every bespoke className button becomes `<Button variant size>`. This single change produces more perceived polish than any gradient.
2. **Kill glow-everything.** Currently ~every interactive element glows on hover (cards, buttons, nodes, borders). Premium dark UIs (Linear, Vercel) use glow **once** — for the primary CTA or active AI state — and rely on subtle borders (`+8% lightness`), background lifts, and 150 ms ease-out transforms elsewhere. Reserve `glow-blue` for "AI is working".
3. **Depth system**: define 3 elevation tokens (flat / raised / overlay) with consistent shadow+border pairs instead of 10 ad-hoc `shadow-2xl`/`shadow-[0_0_...]` variants.
4. **Motion with intent** (see also §4.10): standardize on 120–200 ms ease-out for micro (hover/press), 250–350 ms spring for layout (drawer, modal, tab underline slide — the underline currently just color-swaps; animate `layoutId`-style). Add `prefers-reduced-motion` guards globally. Consider Motion One or Framer Motion for the ~6 places choreography matters: modal enter, tab underline, sidebar collapse, generation reveal, toast slide, node drop-in stagger.
5. **The generation reveal is your signature moment** — design it like a product: sidebar progress → tabs light up one-by-one as sections arrive (needs streaming, §4.10) → auto-switch to HLD → nodes stagger-fade in along dagre layout → edges draw with 300 ms path animation → summary card slides up. This is the clip people will share.
6. **Command palette (Ctrl+K)** — cmdk. Actions: switch tab, new design, generate, export, toggle sidebar, search designs, jump to node on canvas. Highest polish-per-effort feature in this list.
7. **Dashboard cards with diagram thumbnails** (SVG mini-render from stored node positions — you already have positions; 30 lines of SVG).
8. **Header redesign**: 3 zones (nav+breadcrumb "Dashboard / <design>", center empty, actions right), Save→autosave with "Saved 2m ago" text; demote the crown-Pro button to the user menu.
9. **Empty states with product personality**: Canvas empty → ghost-grid with three suggested actions; Challenge empty (Pro) → show one real blurred finding as a teaser instead of generic lock.
10. **Density pass on Sandbox**: it currently has 11 font sizes in one panel. Normalize to 12/13px text, 11px overline labels, and give sparklines fixed-height cards with aligned baselines.

Where glassmorphism is appropriate: modal backdrops, the floating sandbox mode-switcher, command palette. Not on every card.

## 4.5 3D & Motion-Tech Research (Section 5)

Honest assessment: **3D is not what this product needs** — canvas persistence, streaming, and bundle size are. But where 3D/advanced-motion genuinely earns its keep:

| Tech | Use here | Cost | Verdict |
|---|---|---|---|
| **Rive** | Logo mark idle/generating animation; empty-state illustrations; the "AI thinking" orb | ~100 KB runtime, 60fps, tiny files | ✅ Best ROI of all — do this |
| **Motion One / Framer Motion** | Tab underline, modal/drawer choreography, node stagger reveal | 4–30 KB | ✅ Adopt (Motion One if size-sensitive) |
| **Lenis** | Landing-page smooth scroll only | 3 KB | ✅ Landing only |
| **Shader gradient (tiny WebGL or CSS `@property` animation)** | Hero background instead of 12 pulsing divs | small | ✅ Landing hero |
| **React Three Fiber / Three.js** | "Explore architecture in 3D" mode — nodes as extruded panels on a tilted plane, camera fly-through along systemFlow during Walkthrough mode | +150 KB gz, GPU cost, a11y complexity | ⚠️ Phase 4 novelty; only as lazy-loaded opt-in with full 2D fallback. Genuinely differentiating for the *walkthrough/presentation* story, useless for editing |
| **Spline** | Marketing hero object | heavy runtime | ❌ Skip; R3F if ever |
| **Theatre.js** | Choreographing the walkthrough camera timeline | niche | ⚠️ Only if 3D walkthrough ships |
| **Lottie** | – | – | ❌ Rive supersedes |
| **Matter.js / OGL** | – | – | ❌ No physics use case |
| **Aceternity/Magic UI/React Bits** | Cherry-pick 1–2 landing effects (beam, marquee) by copying code, not adding deps | 0 if copied | ⚠️ Copy-paste only |
| **shadcn/ui + Radix** | The actual component layer | 0 runtime | ✅ Foundation, Phase 1 |
| **Fallback/a11y rule** | Every effect: `prefers-reduced-motion` → static; WebGL fail → CSS gradient; mobile → simplified | — | mandatory |

## 4.6 Canvas Mode Audit (Section 6) — the killer feature, currently the weakest feature

**Current reality**: 4 shapes + tech-logo stamps, drag, resize, color/border panel (half of it unreachable due to the edge-click bug), context menu (duplicate/z-order/delete), button-only undo/redo with a broken ring buffer, grid snap. **No persistence, no rename, no keyboard, no copy/paste, no export, no import of the HLD, no groups, no guides, no touch consideration.** Compared to tldraw/Excalidraw this is a weekend prototype.

**Strategic recommendation**: don't rebuild tldraw from scratch. Two viable paths:
- **Path A (recommended): make Canvas = the HLD whiteboard.** Merge CanvasTab into ArchitectureDiagram's flow: one canvas, AI-generated nodes + free shapes/text/icons coexist, one persistence pipeline (already exists for hld), one undo system. This deletes ~600 lines and makes the killer feature real.
- **Path B: embed tldraw** for the freeform layer and keep React Flow for diagrams. Faster to world-class freehand, but two canvases = permanent UX seam.

**Must Have** (whichever path)
- Persistence (autosave, debounced 800 ms, with dirty indicator)
- Label editing (double-click, Excalidraw-style)
- Keyboard: Del, Ctrl+Z/Y, Ctrl+C/V/D, arrows nudge (Shift=10px), Ctrl+A, Esc deselect, Space-pan
- Multi-select drag + group operations; marquee already free via React Flow
- Fix undo ring buffer; push history for every mutating op (edges, deletes, property changes)
- Edge: click-select (fix CSS), labels, delete handle, reconnect
- Export canvas as PNG/SVG (`@xyflow/react` `getNodesBounds` + `html-to-image`)
- "Import current HLD onto canvas" action (Path B only; Path A gets it free)

**Should Have**
- Alignment guides (smart snap lines à la Figma; `@xyflow/react` helper-lines example exists)
- Align/distribute toolbar for multi-select
- Sticky notes + freehand pen (perfect-freehand lib)
- Layers panel (simple ordered list with lock/hide)
- Auto-layout button (dagre already in bundle)
- Zoom-to-fit / zoom presets / minimap toggle
- Context menu on pane: paste, add node here, select all

**Nice to Have**
- Templates gallery of canvas stencils (AWS/GCP icon sets — you have react-icons already)
- Presentation mode (hide chrome, step through frames)
- Comment pins (schema: `{x, y, text, author}` on design)
- Version diff overlay (ghost previous snapshot under current)

**Future Vision**
- Multiplayer via Yjs + y-websocket (React Flow has a documented collab example); presence cursors; share-link editing
- AI-on-canvas: "select 3 nodes → ask AI to refactor into microservices" (generation patches the graph, not the whole design)
- Touch/pen: two-finger pan/pinch already works in React Flow; add long-press context menu and bigger handles at coarse pointers

## 4.7 Sandbox Audit (Section 7)

The Sandbox is the most original feature and closest to "wow". What keeps it from feeling like a real environment:

1. **Correct the model first** (Top 20 #17). A simulator that reports 16% errors at baseline teaches wrong lessons; correctness is the feature. Single-pass topological propagation, capacity from node count × per-type constants, latency via a sane M/M/1-ish curve (`base / (1 - ρ)` clamped), cache hit-ratio only reduces *downstream* traffic.
2. **Determinism + scenario read-out**: after a run, produce a verdict card — "At 15k RPS your DB saturates first (ρ=1.4). Bottleneck: PostgreSQL Primary. Suggested fix: read replica + Redis for profile reads." That's the bridge to Challenge Mode and the moment users screenshot.
3. **Console realism**: the event log is close. Make it a real terminal surface: monospace timestamps, log levels as columns, filter chips (info/warn/error), pause-on-hover autoscroll (currently `scrollIntoView` fights the user's scrollback — classic annoyance), copy button, and structured entries ("`autoscaler` scaled `core-api` 2→3 (cpu 87%)") instead of emoji prose.
4. **Inspector drawer**: click a node during simulation → side panel with its live sparklines (util/latency/error), instance count, and the last 20 log lines mentioning it. (SandboxNodes already carry all telemetry.)
5. **Walkthrough mode** is genuinely good pedagogy. Upgrades: the payload inspector should syntax-highlight (you already have `.code-block` token classes, unused); generate the payloads from the *actual design* (real endpoint paths from `lld.services`, real table names in the SQL) instead of hardcoded `/api/v1/profile` — the data is right there, and it would feel personal instead of canned. Fix "client client".
6. **Timeline scrubber**: record the run (arrays already kept for sparklines); add a scrubber to replay the incident — "watch the cascade after CRASH GATEWAY". Execution playback is what CodeSandbox/Replit can't do for architecture; it's your differentiator.
7. **Performance**: don't re-create the interval per tick (use refs for mutable sim state; one `setInterval` with a reducer), don't `setNodes` on every tick when values are unchanged, keep history buffers at fixed length ring. Target: sim at 5 Hz with zero React re-render of unchanged nodes (memoized custom nodes + data equality).
8. **What NOT to build**: a fake file explorer / fake build output pretending code is being compiled. Users forgive a simulator; they don't forgive fake terminals. If you want "watching a real application being built", the honest version is the AI streaming real artifacts (SQL DDL, OpenAPI YAML, docker-compose) into a read-only editor pane with typewriter reveal — real files, real content, real download.

## 4.8 Performance Audit (Section 8)

Measured/observed:
- **Bundle (from your `dist/`)**: `Editor` chunk **5,002 KB** (~1.2–1.5 MB gz est.), `ScalabilityTab` 984 KB, main 232 KB, `index.es` 147 KB. On a 4G connection the editor is a 5–10 s white wait *after* login. Causes: `import * as SiIcons from 'react-icons/si'` (×2 files), html2pdf (+ its own html2canvas + jspdf — note `purify.es` and `html2canvas` chunks), dagre, all 9 tabs eagerly imported by Editor.
  - Fixes: named icon imports + lazy full-set; `React.lazy` per tab (each tab is already a separate component — free win); dynamic-import html2pdf & dagre; `build.rollupOptions.manualChunks` for xyflow.
  - Targets: Editor initial ≤ 350 KB gz; landing ≤ 120 KB gz.
- **Fonts**: Google Fonts CSS blocking + 3 families × many weights. Self-host with `@fontsource`, subset, `font-display: swap`, preload the two critical woff2 files. Cuts ~300–600 ms FCP.
- **LCP (landing)**: hero H1 — fine once fonts are fixed. **CLS**: font swap + late-loading FloatingPreviewCard; reserve dimensions.
- **INP risks**: Sandbox 200 ms loop re-rendering the entire flow; `JSON.stringify` dependency hacks on every render for ArchitectureDiagram/SandboxTab/DatabaseTab (replace with a stable design-version counter or useMemo on identity); O(n²) overlap check per prop sync.
- **Re-render hygiene**: designStore global `isLoading` couples unrelated UI (dashboard grid skeletons on delete; editor unmount on save). Split per-operation flags.
- **Hydration/SSR**: SPA — fine for the app; consider prerendering the landing (vite-plugin or move landing to static) for SEO+TTFB.
- **Caching**: no `Cache-Control` strategy visible for the API; designs list refetches fully on every dashboard mount — fine at this scale, add SWR/React Query when designs >50.
- **Backend**: single 60–120 s blocking Gemini call per generate ties an Express worker slot; 300 s server timeout. Move to streaming (see §4.10) or at minimum a job + poll pattern to survive Render cold starts and client refreshes mid-generation (currently a refresh orphans the request and the user's quota is spent with no visible result until manual reload).
- **Skeletons**: add for editor tabs and diagram (see §4.1). Never show floating edges without nodes.

## 4.9 Design System Audit (Section 9)

- **Two sources of truth** (tailwind.config extend + :root CSS vars) already disagree in spirit; components bypass both with literal hex arbitrary values. **Decision**: CSS variables as the single source (enables future light theme), Tailwind reads them (`colors: { bg: 'rgb(var(--bg) / <alpha-value>)' ... }`), delete all `text-[#94a3b8]`-style literals via codemod.
- **Token set to define**: color (bg 3 levels, surface, border 2 levels, text 3 levels, brand, 5 semantic, 8 node-type categorical), radius (sm 6 / md 8 / lg 12 / xl 16 — currently 6 values used incl. rounded-2xl/3xl ad hoc), spacing (Tailwind scale, forbid arbitrary), elevation (3), motion (3 durations + 2 easings), type scale (7 steps), z-index scale (already started in config — good).
- **Primitives to build (shadcn pattern)**: Button (primary/secondary/ghost/danger × sm/md/lg, loading prop), Input/Textarea/Select, Badge, Card, Modal/Drawer (Radix Dialog), DropdownMenu (Radix), Tooltip, Tabs, Toggle, Toast (keep react-hot-toast, wrap style centrally), EmptyState, Kbd.
- **Node visual language**: unify CustomNodes vs SandboxNodes vs CanvasNodes header/border/handle styles into one NodeShell with a `variant` — currently three near-identical shells drift independently.
- **Duplicated keyframes** in config + index.css (shimmer, float, gradient-x, etc.) — keep one copy.
- **Documentation**: a single `DESIGN.md` + a `/dev/kitchen-sink` route rendering every primitive in every state. Cheap, forces consistency.

## 4.10 AI Product Experience (Section 10)

This is an AI product whose AI currently feels like a slow HTTP form. The full "magical" pipeline, ranked by impact:

1. **Stream the generation.** Gemini supports `generateContentStream`. Stream section-by-section (or parse the JSON progressively): backend SSE → frontend fills real progress ("Designing HLD — 12 nodes so far…"), tabs light up as their section arrives, and perceived latency drops from 70 s to ~10 s (first visible artifact). This is the single biggest product upgrade available.
2. **Honest thinking state** until streaming lands: elapsed timer, rotating *true* statements ("Gemini 2.5 Flash · ~15k tokens · typically 45–90 s"), cancel button, and survive-refresh (persist `status: generating` — it's already in the schema; poll on editor load; currently a refresh mid-generation shows a stale draft).
3. **Show the uiux output you already generate** — new "Product" tab: screens, user flows (UserFlowDiagram.jsx exists, unused!), and the AI-proposed design system swatches. Zero new AI cost; whole new perceived capability. (Or stop requesting uiux and cut ~30% of tokens/latency per generation.)
4. **Iterative refinement, not regeneration**: "Refine" box on each tab — "add a payment service", "switch to DynamoDB" → send current section JSON + instruction → patch that section only. Cheaper, faster, and turns one-shot generation into a conversation. This is the feature that makes ArchMind a *tool* instead of a *demo*.
5. **Context-aware Challenge Mode**: after simulation, feed sim results into the challenge prompt ("DB saturated at 15k RPS in simulation") — closes the magic loop between Sandbox and Challenge that no competitor has.
6. **Prompt scaffolding UX**: the Requirements textarea is a blank void. Add chips ("marketplace", "real-time chat", "B2B SaaS"…), a "Improve my prompt" mini-action, and 3 example prompts. Quality-in drives quality-out and reduces bad-first-generation churn.
7. **Explain-anything affordance**: every node/edge/decision gets a ✨ hover action — "why Kafka here?" → popover answer from a small cheap model call with design context. Delight-per-token is unbeatable.
8. **Diff view on regeneration**: highlight added/removed/changed nodes (green/red ghosts) instead of silently replacing the graph — builds trust in the AI's edits.
9. **Feedback loop**: thumbs up/down per section stored with the design; later becomes your eval set.
10. **Model transparency**: replace the fake model picker with a real one only when you actually support 2 models; until then show "Powered by Gemini 2.5 Flash" honestly.

---

# 5. Prioritized Roadmap

Effort: S <½ day · M 1–3 days · L 1–2 wks · XL >2 wks. Impact: ★ minor → ★★★ existential.

### Phase 1 — Stop the bleeding (highest ROI, ~1 week)
| Item | Impact | Effort |
|---|---|---|
| Canvas persistence (schema field + autosave + hydrate) | ★★★ | M |
| Fix upsell detection + wire UpgradeModal + kill /upgrade 404s (beta-access capture if no payments yet) | ★★★ | S |
| Split isSaving/isLoading; stop editor unmount on save | ★★★ | S |
| Icon imports fix + lazy html2pdf/dagre + per-tab React.lazy (5 MB → <400 KB gz) | ★★★ | M |
| Remove Pro backdoor; rotate & re-secure secrets; CORS allowlist; express-rate-limit on auth+generate | ★★★ | S |
| Rollback order fix; sandbox flowRPS reset fix; edge pointer-events fix | ★★ | S |
| Post-generation: navigate to HLD + success state; clamp/unify progress steps | ★★★ | S |
| Copy honesty sweep (fake toggles, team-notified, thousands-of-engineers, pricing drift) | ★★ | S |

### Phase 2 — Feel premium (2–3 weeks)
| Item | Impact | Effort |
|---|---|---|
| Design tokens consolidation + Button/Input/Card/Modal/Dropdown primitives (Radix/shadcn) + codemod hex literals | ★★★ | L |
| Streaming generation (SSE) with progressive tab reveal | ★★★ | L |
| Canvas Must-Haves: rename, keyboard set, copy/paste, fixed undo, edge editing, PNG/SVG export, merge-with-HLD decision | ★★★ | L |
| Onboarding: seeded example design + first-run sidebar spotlight + template previews | ★★ | M |
| Autosave + "Saved · 2m ago"; remove manual Save as primary | ★★ | M |
| A11y pass: focus-visible everywhere, aria-labels, 12px text floor, contrast tokens, reduced-motion | ★★ | M |
| 401 interceptor + session-expiry UX; error-state redesign (inline, actionable) | ★★ | S |
| Toast reposition, header 3-zone redesign, tab icons instead of emoji | ★ | S |

### Phase 3 — Differentiate (3–5 weeks)
| Item | Impact | Effort |
|---|---|---|
| Iterative AI refinement per section (patch, not regenerate) + diff view | ★★★ | L |
| Sandbox model correctness + verdict card + node inspector + log console upgrade + replay scrubber | ★★★ | L |
| "Product" tab rendering the uiux payload (screens/flows/design-system) | ★★ | M |
| Command palette (cmdk) + shortcut system + `?` overlay | ★★ | M |
| Dashboard thumbnails, starring (real), pagination | ★ | M |
| Real payments (Stripe) + server-enforced gating coherence | ★★★ | L |
| Walkthrough payloads generated from the actual design | ★★ | M |
| PDF/exports rework: light-theme print stylesheet, OpenAPI YAML download (code exists, unwired), docker-compose export | ★★ | M |

### Phase 4 — Category leadership (quarter+)
| Item | Impact | Effort |
|---|---|---|
| Realtime multiplayer canvas (Yjs) + comments + presence | ★★★ | XL |
| Sim-informed Challenge Mode (closed loop) | ★★ | M |
| 3D walkthrough/presentation mode (R3F, lazy, opt-in) | ★ | XL |
| GitHub repo → architecture import; Terraform/IaC export | ★★★ | XL |
| Team workspaces, RBAC, SSO | ★★ | XL |
| Public template/community gallery | ★★ | L |

### Future vision (12 mo)
ArchMind becomes the "Figma for system design": the canvas is the product; AI is a collaborator that drafts, critiques (Challenge), and stress-tests (Sandbox) in one loop; interviews prep, team design reviews, and doc export are the three wedges. Everything in Phases 1–3 serves that; nothing in Phase 4 matters until Phase 1 trust issues are gone.

---

# 6. Redesigned Product Vision (per page)

Specs are written so another designer could execute them. Global: 12-col / 1280 max grid (marketing), 8-pt spacing, tokenized colors, Space Grotesk headings / Inter UI / JetBrains data, motion 150 ms ease-out micro · 300 ms spring structural, all effects gated by reduced-motion.

### 6.1 Landing
- **Layout**: Nav (64px, blur, border-b) → Hero (90vh) → Social proof strip (real or omitted) → Interactive demo section → Features (3×2) → How it works (horizontal 3-step) → Sandbox teaser (looping 8 s product video) → Pricing → FAQ → CTA → slim footer. *Remove Technical Reference.*
- **Hero**: left 6 cols — overline badge, H1 64/56, subhead 20 (`max-w-[52ch]`), CTA row (primary "Generate your first architecture — free" + secondary "Watch 60-sec demo" opening a real video modal), trust row. Right 6 cols — **live animated blueprint**: a real React Flow render (read-only, auto-playing walkthrough packets), not a fake div collage. WebGL/CSS animated gradient behind, single source of glow.
- **Interactive demo** (signature section): a prompt input pre-filled with "A food-delivery app for 100k users" and a Generate button that plays a *pre-recorded* streaming reveal (no auth, no API) — lets visitors feel the magic in 10 s.
- **Pricing**: 2 cards, no fake badge; feature list identical order both sides; footnote linking Terms/Privacy (real pages).
- Motion: Lenis scroll, sections fade-up 24px once, packets flowing continuously in hero.

### 6.2 Auth (Login/Signup)
Keep current structure (it's good). Changes: replace pulse-nodes with slow 6 s float + packet line animation; real Terms/Privacy links; forgot-password link (even if it emails a manual reset initially); unify focus ring to brand; password strength driven by zxcvbn-lite logic; on submit error, shake (4px, 250 ms) + inline field messages; SSO buttons (GitHub/Google) Phase 3.

### 6.3 Dashboard
- **Layout**: header (search center-aligned 480px, user menu right) → greeting row ("Good evening, Ankit" + New Design) → stats as one slim strip (not 4 heavy cards; 32px numerals, divider-separated) → filter chips row (All / Recent / Starred / Shared) → **card grid with diagram thumbnails** (16:9 SVG mini-graph, node-type colors, hover = subtle lift + thumbnail pans slightly), title, relative time, status dot, kebab menu (Open/Duplicate/Share/Delete with proper confirm dialog).
- Empty state: illustration (Rive), one-line value prop, two buttons: "Generate from prompt" / "Start from template", plus the seeded example card already present.
- Skeletons match card geometry exactly; deletion animates card collapse (200 ms) without grid flash.

### 6.4 Editor shell
- **Header**: breadcrumb "⌂ / Ride-sharing app" (title inline-editable on click, 480px max), right: autosave status text, Share (primary-ghost), Export menu, ⌘K hint, avatar. No crown button.
- **Left rail** (icon rail 56px, expandable to 280px): Requirements (pencil), Design tabs group, Canvas, Simulate, Review, History — replaces the 9-tab horizontal scroll; tabs get lucide icons + tooltips + number badges (e.g., Challenge findings count).
- **Requirements panel**: prompt-first design — big textarea with chips, constraints as compact segmented controls, sticky Generate button with usage meter above it; generating state = streaming checklist of *real* sections with token/elapsed counters.
- **Generation reveal**: auto-switch to HLD; nodes stagger in (30 ms delay each, fade+rise 8px), edges draw 300 ms after; toast "Blueprint ready — 14 components, 6 services".

### 6.5 HLD tab
Diagram fills viewport height minus 200px summary drawer (collapsible). Node single-click = select (properties in right drawer), double-click = rename inline, Enter = edit drawer. Edge labels: hidden until zoom > 0.75 or hover; chip background. Toolbar top-center floating: Add node ▾, Auto-layout, Fit, Fullscreen, Export PNG. Summary/tradeoffs/decisions live in a right-side "Docs" drawer with anchored sections instead of an endless scroll below the canvas.

### 6.6 Canvas (merged whiteboard)
One canvas = HLD + freeform. Left floating tool strip (V select, R rect, O ellipse, D diamond, T text, P pen, I icon, C connector — single-key shortcuts). Right properties drawer (contextual: node / edge / multi / canvas). Top-right: undo/redo/zoom/fullscreen/share-frame. Bottom-left: minimap toggle. Alignment guides on drag; distribute controls on multi-select; sticky notes amber default; presentation mode hides all chrome (press `.`). Autosaved badge bottom-right.

### 6.7 Database / LLD / APIs / Scalability
- Database: ER canvas 60% height; table nodes get column-type icons and FK edge hover-highlight of both endpoints; "Download DDL" + "Copy as Mermaid".
- LLD: service selector becomes left sub-nav list (name + endpoint count); class cards get language-colored method chips; classDiagram string rendered via Mermaid (already Mermaid-compatible per prompt) instead of `<pre>`.
- APIs: endpoint rows get "Try example" copy-as-curl; request/response payloads syntax-highlighted (existing token CSS).
- Scalability: stress markers on the meter become clickable → popover with fix suggestion; failure/security/observability cards get severity-colored left borders consistent with Challenge.

### 6.8 Sandbox
Three-zone layout: canvas (fluid) / bottom control deck (72px: play, RPS slider with log scale + live number, preset select, chaos buttons as icon-toggles with tooltips) / right telemetry rail (fixed 320px: verdict card on stop, three sparkline cards, cost+requests row, log console with filters and pause-on-hover). Walkthrough mode swaps the deck for transport controls (prev/play/next, speed) + step timeline. Node inspector drawer on click. All simulated numbers labeled "simulated".

### 6.9 Challenge
Free users: real teaser — one actual finding visible, rest blurred cards with lock badges, inline plan comparison, working upgrade CTA. Pro: findings as a triaged list (severity sort, filter chips), each expandable with Fix and "Apply suggestion to design" (Phase 3 AI patch). Header shows score delta vs last run.

### 6.10 History
Timeline keeps current structure; add per-version node-count/table-count chips and a "Preview" (read-only render in a modal) before rollback; rollback confirm becomes a proper dialog stating exactly what will happen (post-fix semantics).

### 6.11 Public share
True read-only (no drawers, no handles); hero header with design title + author + "Made with ArchMind — build yours" CTA; tabs limited to content that exists; OG image generated from the diagram thumbnail for link unfurls.

### 6.12 404 / errors
Keep 404 art; render in place (preserve URL). Add error boundary page variant with "Copy error details" instead of the false "team has been notified".

---

## Appendix A — Notes from the live session
- Test account created: `audit.tester@example.com` (free), with two designs ("3-Tier SaaS Web App Preset" template + one real Gemini generation, ~70 s, 1/3 quota used) — in your Atlas `hld` DB; delete at will.
- Servers were run locally for the audit (backend `node server.js`, frontend Vite via the preview harness). No project files modified; the only file added is this report. A launch entry for the frontend was added to the Claude harness config (`E:\coding\jarvis\.claude\launch.json`), outside this project.
- Console was clean of errors during the full walkthrough (one gray-flash of edges-without-nodes during generated-HLD reveal; screenshots retained in session).
