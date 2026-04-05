# PeptidePin Progress Log

_Last updated: 2026-04-05_

A working log of what's been built. Ordered newest → oldest by commit date.
For exact diffs, check `git log`.

---

## Current State Snapshot

### Shipped & working
- **Public calculator** — hub + per-peptide + size-specific + titration planner pages. SEO-indexed. Works without auth.
- **Guided wizard + Quick calculator modes** — toggle on peptide pages. GLP-1s show mg, others show mcg.
- **BAC water calculator + unit converter** — standalone public tools.
- **Landing page** — long-form one-pager with embedded live calculator.
- **Auth** — Supabase SSR, Google OAuth + email/password, protected middleware.
- **Dashboard** (authenticated) — Getting Started checklist, Next Dose Hero, Reorder Alerts, Vial Runway Forecast, Titration Advance Banner, Today's Doses with one-tap log + undo, Adherence Streak, Active Vials grid, Quick Actions (Calc / Add Vial / Log Dose).
- **Vial management** — add vial form (React Hook Form + Zod + live preview), vial list with low-stock/expiry badges, vial detail with edit/archive/delete, smart delete (archives if dose logs exist).
- **Schedules** — create with dynamic time slots by frequency, edit via sheet, pause/resume, delete. Native-select dropdowns for mobile.
- **Dose logging** — one-tap from dashboard (Next Dose Hero or DoseCard), manual backdate from dashboard sheet, 5-second undo window, skip with reason, DB trigger auto-restores `remaining_mcg` on delete.
- **History** — 100 most recent logs, grouped by date, stats bar (total / taken / adherence %), GLP-1 doses shown in mg.
- **Settings** — profile (name, unit preference), dark mode toggle, notification permission toggle, JSON data export, sign out.
- **Web Push Notifications** — client-side scheduling while tab is open. VAPID keys configured.
- **Titration Advance Banner** — auto-detects GLP-1 users ready for next dose step, one-tap apply.
- **AI Chat Assistant** — floating widget in authenticated layout. OpenRouter (default claude-haiku-4-5), hardened system prompt, local fallback KB for offline mode, per-user history in Postgres with RLS.
- **Save to Account CTA** — calculator result pages prompt anon users to create account (preserves calc params via query string).
- **Auth-aware public header** — shows "Dashboard" for logged-in, "Sign in" for anon.

### Database schema (Supabase)
Tables: `profiles`, `peptides`, `peptide_variants`, `peptide_titration_steps`, `user_peptides`, `dose_schedules`, `dose_logs`, `mixing_calculations`, `chat_messages`.

Migrations run in order:
1. `001_initial_schema.sql` — base tables, RLS, deduct_dose trigger
2. `seed.sql` — 23 base peptides
3. `002_seo_calculator.sql` — variants, titration steps, SEO fields
4. `seed_variants.sql` — size variants + FAQs + how-to-calculate
5. `003_restore_dose_trigger.sql` — restore trigger on dose_log DELETE (enables undo)
6. `004_chat_messages.sql` — chat_messages table + RLS

### Env vars (Vercel + .env.local)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `OPENROUTER_API_KEY` (optional — chat falls back to local KB if unset)
- `OPENROUTER_MODEL` (optional — defaults to `anthropic/claude-haiku-4-5-20251001`)
- `NEXT_PUBLIC_SITE_URL` (optional — used for OpenRouter HTTP-Referer attribution)

---

## Commit Timeline (newest first)

### 2026-04-05

**`ab602cf` — QC pass on runway + chat (5 high, 3 medium, 3 low fixes)**
- H1: `simulateRunway` clones `options.now` to avoid mutating caller's Date
- H2: `days_of_week` respected in burn rate calc; unknown frequencies log warn and return 0
- H3: chat_messages insert errors logged instead of silently failing
- H5: removed dead `MessageCircle` import hack
- H6: `formatDaysLeft` handles negatives ("Overdue Nd") and uses "Today"/"Tomorrow"
- M2: word-boundary matching for peptide aliases (no more false positives on "bpc"/"reta")
- M6: `stock_out`/`expired` jump to top of reorder queue
- M7: textarea `maxLength={2000}`
- M8: `clearHistory` resets `loaded` flag
- L1: `HTTP-Referer` uses `NEXT_PUBLIC_SITE_URL` env var
- L9: chat z-index raised to 60 (above bottom-nav), mobile panel height accounts for nav
- L10: focus setTimeout cleaned up on unmount
- L12: `aria-label` on icon-only buttons
- L13: lightweight `**bold**` markdown rendering in message bubbles

**`69daa33` — feat: vial runway forecast + AI chat assistant + 2 QC bug fixes**
- New `src/lib/runway.ts` — pure simulation engine. Per-vial weekly burn, runout date, 28-day expiry, effective end date, status enum.
- New `src/components/dashboard/runway-forecast-card.tsx` — dashboard widget with progress bars + status pills.
- New AI chat system: `chat-context.ts`, `peptide-chat-knowledge.ts` (10 peptides), `api/chat/route.ts`, `api/chat/history/route.ts`, `components/chat/chat-widget.tsx`, `supabase/migrations/004_chat_messages.sql`.
- QC fixes: `reorder-alerts.tsx` timezone-safe date parsing, `manual-log-sheet.tsx` ISO timestamp wrapping.

**`bd6572e` — feat: full user flow — auth-aware header, save CTA, onboarding checklist**
- `PublicHeader` component with auth-aware Dashboard/Sign-in button
- `SaveToAccountCTA` on calculator result pages
- `AddPeptideForm` reads query params for prefill from calculator
- `GettingStarted` checklist on dashboard (4-step onboarding with tips)

**`4e973e7` — fix: invalid timestamp when logging dose**
- Normalize `HH:MM:SS` → `HH:MM` via `.slice(0, 5)` before building `scheduled_at`
- Use `new Date(...).toISOString()` everywhere instead of string concat
- Applied to dose-card, next-dose-hero, dashboard-content, notifications lib

**`c469596` — feat: 5 new features — edit schedule, manual log, titration advance, reorder alerts, notifications**
- `EditScheduleSheet` — change dose/frequency/times without delete
- `ManualLogSheet` — backdate or log unscheduled doses
- `TitrationAdvanceBanner` — detects GLP-1 users ready for next step
- `ReorderAlerts` — low stock + expiring vials on dashboard
- Client-side local notifications via `scheduleTodayNotifications`

**`091eaa4` — fix: redirect to login when user is null on authenticated pages**
- Added explicit `if (!user) redirect(...)` to all `(app)/**` pages
- Removed `user!.id` assumption pattern

**`3dad1e1` — fix: schedule form UX — show peptide names not UUIDs, readable frequency**
- Replaced shadcn Select with native `<select>` for mobile reliability
- Peptide dropdown shows "BPC-157 — 5mg" instead of raw UUID
- Frequency shows "Once daily" instead of "once_daily"

**`4afe329` — fix: QC audit — 3 critical + 2 high + 3 medium issues resolved**
- C1: `dose-logs POST` verifies vial ownership before insert
- C2: `dose-logs POST` validates with Zod
- C3: Removed `biweekly`/`monthly` from Zod (DB constraint doesn't allow them)
- H1: Dashboard syringe units no longer divided by 1000 (was 1000x wrong)
- H2: `useLogDose` hook uses API route (server-side validation)
- M1: `restore_dose` trigger uses `SECURITY DEFINER`
- M4: `recentLogs` includes all statuses for accurate adherence

### 2026-04-04

**`89eed56` — feat: complete app rebuild — Phases 2-6**
- Phase 2: Vial management (forms, edit sheet, archive dialog, badges)
- Phase 3: Schedule CRUD with pause/resume/delete
- Phase 4: **CRITICAL BUG FIX** — dose matching by `schedule_id + time_slot` (previously marked all time slots done when one was logged). NextDoseHero card. One-tap logging via `useLogDose` hook with 5-second undo. 14-day adherence streak.
- Phase 5: Enhanced history with stats bar and icon indicators
- Phase 6: Settings data export as JSON

**`6539891` — feat: Phase 1 foundation — validation, APIs, loading states, shared components**
- Zod schemas for all forms
- CRUD API routes: user-peptides, schedules, dose-logs (POST/PATCH/DELETE)
- Loading skeletons + error boundaries for all authenticated routes
- Shared: `ConfirmDialog`, `EmptyState`, `PageSkeleton`
- `useLogDose` hook with 5-second undo
- `restore_dose` DB trigger for undo

### 2026-03-21 (Earlier)

**`c4ae144`, `baa1460`** — GLP-1 mg/mcg display fixes across calculator V2 and guided wizard
**`8bd1407`** — Guided wizard mode + peptide knowledge base + BAC water recommendations
**`ee837b6`** — Calculator UX overhaul (button groups, horizontal syringe, sticky result, long-form landing page)
**`61d05a6`** — Phase 1 SEO calculator rebuild — public pages, variants, titration
**`24db3cf`** — Initial PeptidePin build (landing, auth, dashboard skeleton)

---

## Known Issues / Deferred

### Non-blocking (from last QC, 2026-04-05)
- **M1** (runway): no exhaustiveness check on RunwayStatus switch — low risk unless new statuses added
- **M4** (chat-context): loose `as any` Supabase casts — project-wide pattern
- **L2**: OpenRouter model name includes date stamp (`claude-haiku-4-5-20251001`) — brittle when Anthropic updates
- **L4**: `reorder-alerts.tsx` reads `Date.now()` inline — stylistic only
- **L7**: expired check fires before stock_out (intentional per status priority spec)
- **L8**: vials/schedules used in two separate useMemo contexts — confusing but not wrong
- **L11**: `system` role allowed in chat_messages CHECK but never inserted — dead surface area

### Out of scope for current build phase
- **Subscriptions / billing / paywalls / tier logic** — user explicitly said not now
- **Cost tracking** — add `vial_cost` field, cost-per-dose dashboard, monthly spend
- **Shareable dose card PNG export** — viral growth hook via `html-to-image` lib
- **Per-user titration tracking** — "I'm on week 3 of tirzepatide" auto-advance
- **Multi-vial batch protocol planner** — cross-peptide cycle planning
- **Analytics / charts** — requires `recharts` install
- **Capacitor iOS wrapper** — separate project
- **Background push notifications** — requires service worker + web-push server infrastructure (current notifications only fire while tab is open)

---

## Research & Planning Docs
- `docs/research/competitive_analysis_deep_2026.md` — 10 competitors profiled
- `docs/research/research_peptide_workflow.md` — user journey, protocols, UX insights
- `docs/research/seo_growth_strategy.md` — keyword research, programmatic SEO
- `docs/research/virality_community_strategy.md` — viral features, community, B2B
- `docs/research/MEMORY.md` — the old Claude Code memory index (snapshot)

---

## Quick Commands

```bash
# Dev
npm run dev

# Production build (use this memory override on the Windows dev machine)
NODE_OPTIONS="--max-old-space-size=4096" npx next build

# Kill stale node processes if build hits OOM
taskkill //F //IM node.exe

# Commit + deploy
git add <files>
git commit -m "..."
git push origin main  # Vercel auto-deploys
```

## Apply Pending Migrations

Run in Supabase SQL Editor (https://supabase.com/dashboard/project/smioldlkiyipshzivbvk/sql/new) in this order if setting up fresh:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/002_seo_calculator.sql`
4. `supabase/seed_variants.sql`
5. `supabase/migrations/003_restore_dose_trigger.sql`
6. `supabase/migrations/004_chat_messages.sql`
