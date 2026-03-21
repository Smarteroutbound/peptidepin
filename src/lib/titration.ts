/**
 * Titration planning logic for peptide dose ramp-up schedules.
 */

import type { TitrationStep } from '@/types/database';
import { mcgToMg } from './calculations';

export interface TitrationWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  doseMcg: number;
  stepNumber: number;
  stepLabel: string;
  isLastWeekOfStep: boolean;
}

const MAINTENANCE_DISPLAY_WEEKS = 4;

/** Build a week-by-week calendar for a full titration schedule */
export function buildTitrationCalendar(
  steps: TitrationStep[],
  startDate: Date
): TitrationWeek[] {
  const weeks: TitrationWeek[] = [];
  let weekNumber = 1;
  let currentDate = new Date(startDate);

  for (const step of steps) {
    const duration =
      step.duration_weeks === 0 ? MAINTENANCE_DISPLAY_WEEKS : step.duration_weeks;

    for (let w = 0; w < duration; w++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        doseMcg: step.dose_mcg,
        stepNumber: step.step_number,
        stepLabel: step.label ?? `Step ${step.step_number}`,
        isLastWeekOfStep: w === duration - 1,
      });

      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
  }

  return weeks;
}

/** Calculate number of vials needed for each step and total */
export function calculateVialsNeeded(
  steps: TitrationStep[],
  vialSizeMcg: number,
  dosesPerWeek: number = 1
): {
  totalVials: number;
  vialsPerStep: { stepNumber: number; vials: number; totalDoseMcg: number }[];
} {
  const vialsPerStep = steps.map((step) => {
    const duration =
      step.duration_weeks === 0 ? MAINTENANCE_DISPLAY_WEEKS : step.duration_weeks;
    const totalDoseMcg = step.dose_mcg * duration * dosesPerWeek;
    const vials = Math.ceil(totalDoseMcg / vialSizeMcg);
    return { stepNumber: step.step_number, vials, totalDoseMcg };
  });

  const totalVials = vialsPerStep.reduce((sum, s) => sum + s.vials, 0);

  return { totalVials, vialsPerStep };
}

/** Get the date when the user reaches the final (maintenance) step */
export function getMaintenanceDate(
  steps: TitrationStep[],
  startDate: Date
): Date {
  const nonMaintenanceWeeks = steps
    .filter((s) => s.duration_weeks > 0)
    .reduce((sum, s) => sum + s.duration_weeks, 0);

  const maintenanceDate = new Date(startDate);
  maintenanceDate.setDate(
    maintenanceDate.getDate() + nonMaintenanceWeeks * 7
  );
  return maintenanceDate;
}

/** Total weeks in the titration schedule (maintenance counted as 4) */
export function getTotalTitrationWeeks(steps: TitrationStep[]): number {
  return steps.reduce(
    (sum, s) =>
      sum + (s.duration_weeks === 0 ? MAINTENANCE_DISPLAY_WEEKS : s.duration_weeks),
    0
  );
}

/** Generate an .ics calendar file for the titration schedule */
export function generateICS(
  calendar: TitrationWeek[],
  peptideName: string
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PeptidePin//Titration//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const week of calendar) {
    const doseMg = mcgToMg(week.doseMcg);
    const dtStart = formatICSDate(week.startDate);
    const dtEnd = formatICSDateWithOffset(week.startDate, 15);
    const uid = `peptidepin-${peptideName}-w${week.weekNumber}@peptidepin.com`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${peptideName} ${doseMg}mg injection`,
      `DESCRIPTION:Week ${week.weekNumber} - ${week.stepLabel}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** Format a Date as an ICS UTC datetime string (YYYYMMDDTHHMMSSZ) */
function formatICSDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

/** Format a Date offset by N minutes as an ICS UTC datetime string */
function formatICSDateWithOffset(date: Date, offsetMinutes: number): string {
  const offset = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return formatICSDate(offset);
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
