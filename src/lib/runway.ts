/**
 * Vial runway simulation — answers "when will my vials run out, when should I reorder?"
 *
 * Pure function, no DB calls. Given the user's active vials and active dose schedules,
 * computes weekly burn rate, runout date, expiry date, and reorder urgency for each vial.
 *
 * Inspired by TheSethRose/PeptideCalc's generateSchedule() simulation loop.
 */

import type { UserPeptide, DoseSchedule } from "@/types/database";

export type RunwayStatus =
  | "ok"
  | "reorder_soon"
  | "reorder_now"
  | "stock_out"
  | "expired";

export interface VialForecast {
  vialId: string;
  peptideName: string;
  startingMcg: number;
  currentMcg: number;
  weeklyBurnMcg: number;
  weeksRemaining: number; // may be Infinity if no active schedule
  runoutDate: Date | null;
  expiryDate: Date | null; // reconDate + 28 days
  effectiveEndDate: Date | null; // min(runoutDate, expiryDate)
  daysUntilEnd: number | null;
  status: RunwayStatus;
  scheduleIds: string[];
}

export interface RunwayForecast {
  vials: VialForecast[];
  earliestEndDate: Date | null;
  totalWeeklyBurnMcg: number;
  overallStatus: "ok" | "attention" | "critical" | "idle";
  nextReorderVialId: string | null;
}

const VIAL_SHELF_LIFE_DAYS = 28;
const DEFAULT_REORDER_LEAD_DAYS = 7;
const REORDER_SOON_DAYS = 14;

/**
 * Compute weekly dose burn from a schedule, in mcg/week.
 *
 * Frequency semantics:
 * - once_daily:       dose * 7
 * - twice_daily:      dose * 14
 * - three_daily:      dose * 21
 * - every_other_day:  dose * 3.5
 * - weekly:           dose * times_of_day.length (usually 1 per week per time slot)
 * - custom:           dose * times_of_day.length * 7 (assume daily custom times)
 */
function scheduleWeeklyBurnMcg(schedule: DoseSchedule): number {
  const dose = schedule.dose_mcg || 0;
  const slots = (schedule.times_of_day || []).length || 1;
  const daysOfWeek = schedule.days_of_week;

  // If days_of_week is specified (Mon/Wed/Fri style), use that count
  // as the frequency-per-week multiplier, regardless of label.
  if (daysOfWeek && daysOfWeek.length > 0 && schedule.frequency !== "custom") {
    return dose * slots * daysOfWeek.length;
  }

  switch (schedule.frequency) {
    case "once_daily":
      return dose * 7;
    case "twice_daily":
      return dose * 14;
    case "three_daily":
      return dose * 21;
    case "every_other_day":
      return dose * 3.5;
    case "weekly":
      return dose * slots;
    case "custom":
      return dose * slots * 7;
    default:
      console.warn("Unknown schedule frequency:", schedule.frequency);
      return 0;
  }
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Determine reorder status for a vial given its end date.
 */
function computeStatus(
  currentMcg: number,
  weeklyBurn: number,
  effectiveEndDate: Date | null,
  expiryDate: Date | null,
  today: Date,
  reorderLeadDays: number
): RunwayStatus {
  if (expiryDate && expiryDate.getTime() < today.getTime()) return "expired";
  if (currentMcg <= 0) return "stock_out";
  if (weeklyBurn === 0 && !expiryDate) return "ok"; // no schedule, no expiry concern
  if (!effectiveEndDate) return "ok";

  const days = daysBetween(today, effectiveEndDate);
  if (days <= reorderLeadDays) return "reorder_now";
  if (days <= REORDER_SOON_DAYS) return "reorder_soon";
  return "ok";
}

/**
 * Build a forecast for all user vials.
 */
export function simulateRunway(
  vials: Array<UserPeptide & { peptide?: { name?: string | null } | null; custom_label?: string | null }>,
  schedules: DoseSchedule[],
  options?: { reorderLeadDays?: number; now?: Date }
): RunwayForecast {
  const reorderLeadDays = options?.reorderLeadDays ?? DEFAULT_REORDER_LEAD_DAYS;
  // H1 FIX: clone to avoid mutating caller's Date
  const today = new Date(options?.now?.getTime() ?? Date.now());
  today.setHours(0, 0, 0, 0);

  const activeVials = vials.filter((v) => v.is_active);
  const activeSchedules = schedules.filter((s) => s.is_active);

  const vialForecasts: VialForecast[] = activeVials.map((vial) => {
    const linkedSchedules = activeSchedules.filter(
      (s) => s.user_peptide_id === vial.id
    );
    const weeklyBurn = linkedSchedules.reduce(
      (sum, s) => sum + scheduleWeeklyBurnMcg(s),
      0
    );

    const currentMcg = vial.remaining_mcg ?? 0;
    const startingMcg = vial.vial_size_mcg ?? 0;

    // Runout date from burn rate
    let weeksRemaining = Infinity;
    let runoutDate: Date | null = null;
    if (weeklyBurn > 0 && currentMcg > 0) {
      weeksRemaining = currentMcg / weeklyBurn;
      runoutDate = addDays(today, Math.floor(weeksRemaining * 7));
    } else if (weeklyBurn > 0 && currentMcg <= 0) {
      weeksRemaining = 0;
      runoutDate = today;
    }

    // Expiry from reconstitution date
    let expiryDate: Date | null = null;
    if (vial.date_reconstituted) {
      const reconDate = new Date(vial.date_reconstituted + "T00:00:00");
      expiryDate = addDays(reconDate, VIAL_SHELF_LIFE_DAYS);
    }

    // Effective end date = sooner of runout or expiry
    let effectiveEndDate: Date | null = null;
    if (runoutDate && expiryDate) {
      effectiveEndDate =
        runoutDate.getTime() < expiryDate.getTime() ? runoutDate : expiryDate;
    } else if (runoutDate) {
      effectiveEndDate = runoutDate;
    } else if (expiryDate) {
      effectiveEndDate = expiryDate;
    }

    const daysUntilEnd = effectiveEndDate
      ? daysBetween(today, effectiveEndDate)
      : null;

    const status = computeStatus(
      currentMcg,
      weeklyBurn,
      effectiveEndDate,
      expiryDate,
      today,
      reorderLeadDays
    );

    return {
      vialId: vial.id,
      peptideName:
        vial.custom_label || vial.peptide?.name || "Unknown peptide",
      startingMcg,
      currentMcg,
      weeklyBurnMcg: weeklyBurn,
      weeksRemaining,
      runoutDate,
      expiryDate,
      effectiveEndDate,
      daysUntilEnd,
      status,
      scheduleIds: linkedSchedules.map((s) => s.id),
    };
  });

  // Aggregate stats
  const withDates = vialForecasts.filter((v) => v.effectiveEndDate);
  const earliestEndDate = withDates.length
    ? withDates.reduce((earliest, v) =>
        !earliest.effectiveEndDate ||
        (v.effectiveEndDate &&
          v.effectiveEndDate.getTime() < earliest.effectiveEndDate.getTime())
          ? v
          : earliest
      ).effectiveEndDate
    : null;

  const totalWeeklyBurnMcg = vialForecasts.reduce(
    (sum, v) => sum + v.weeklyBurnMcg,
    0
  );

  // Urgency ranking: stock_out/expired first, then reorder_now, then reorder_soon.
  // Within the same urgency, sort by effective end date ascending.
  const urgencyRank: Record<RunwayStatus, number> = {
    stock_out: 0,
    expired: 0,
    reorder_now: 1,
    reorder_soon: 2,
    ok: 99,
  };
  const nextReorderVial =
    vialForecasts
      .filter(
        (v) =>
          v.status === "reorder_now" ||
          v.status === "reorder_soon" ||
          v.status === "stock_out" ||
          v.status === "expired"
      )
      .sort((a, b) => {
        const rankDiff = urgencyRank[a.status] - urgencyRank[b.status];
        if (rankDiff !== 0) return rankDiff;
        if (!a.effectiveEndDate) return 1;
        if (!b.effectiveEndDate) return -1;
        return a.effectiveEndDate.getTime() - b.effectiveEndDate.getTime();
      })[0] || null;

  // Overall status
  let overallStatus: RunwayForecast["overallStatus"] = "ok";
  if (vialForecasts.length === 0) {
    overallStatus = "idle";
  } else if (
    vialForecasts.some(
      (v) =>
        v.status === "stock_out" ||
        v.status === "expired" ||
        v.status === "reorder_now"
    )
  ) {
    overallStatus = "critical";
  } else if (vialForecasts.some((v) => v.status === "reorder_soon")) {
    overallStatus = "attention";
  }

  return {
    vials: vialForecasts,
    earliestEndDate,
    totalWeeklyBurnMcg,
    overallStatus,
    nextReorderVialId: nextReorderVial?.vialId ?? null,
  };
}

/**
 * Human-readable label for a runway status.
 */
export function runwayStatusLabel(status: RunwayStatus): string {
  switch (status) {
    case "ok":
      return "On track";
    case "reorder_soon":
      return "Reorder soon";
    case "reorder_now":
      return "Reorder now";
    case "stock_out":
      return "Empty";
    case "expired":
      return "Expired";
  }
}
