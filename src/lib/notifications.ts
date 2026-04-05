/**
 * Client-side notification layer.
 *
 * Fires browser notifications for upcoming doses when the tab is open.
 * Persists a "notification schedule" in localStorage to avoid duplicate firings.
 *
 * Note: this works when the browser tab is open. For background push
 * notifications when the app is closed, a separate service worker + web-push
 * infrastructure is needed.
 */

interface ScheduledNotification {
  id: string; // unique: schedule_id + date + time
  scheduleId: string;
  peptideName: string;
  doseMcg: number;
  syringeUnits: number;
  firesAt: number; // epoch ms
}

const FIRED_KEY = "peptidepin:fired-notifications";
const MAX_HISTORY = 50;

/** Request notification permission */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Check if notifications are enabled */
export function notificationsEnabled(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return Notification.permission === "granted";
}

/** Get list of already-fired notification IDs (to avoid duplicates) */
function getFiredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Mark a notification as fired */
function markFired(id: string) {
  if (typeof window === "undefined") return;
  const fired = getFiredIds();
  if (fired.includes(id)) return;
  fired.push(id);
  // Keep only last N to prevent localStorage bloat
  const trimmed = fired.slice(-MAX_HISTORY);
  localStorage.setItem(FIRED_KEY, JSON.stringify(trimmed));
}

/** Fire a single notification */
function fireNotification(
  title: string,
  body: string,
  tag: string,
  onClick?: () => void
) {
  if (!notificationsEnabled()) return;
  try {
    const notification = new Notification(title, {
      body,
      tag,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      requireInteraction: false,
    });
    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };
  } catch (e) {
    console.warn("Failed to show notification", e);
  }
}

/**
 * Schedule all upcoming dose notifications for today based on dose schedules.
 * Returns a cleanup function that cancels pending notifications.
 *
 * Call this once when the dashboard mounts. It will:
 * 1. Compute all dose times for today
 * 2. Filter out ones already fired or in the past
 * 3. Set timers that fire at each time
 */
export function scheduleTodayNotifications(
  schedules: Array<{
    id: string;
    dose_mcg: number;
    times_of_day: string[];
    is_active: boolean;
    user_peptide?: {
      custom_label?: string | null;
      peptide?: { name?: string; category?: string } | null;
    };
  }>,
  logs: Array<{ schedule_id: string | null; scheduled_at: string | null; status: string }>,
  getSyringeUnits: (schedule: any) => number
): () => void {
  if (!notificationsEnabled()) return () => {};

  const today = new Date().toISOString().split("T")[0];
  const timers: ReturnType<typeof setTimeout>[] = [];
  const fired = getFiredIds();

  for (const schedule of schedules) {
    if (!schedule.is_active) continue;
    const peptideName =
      schedule.user_peptide?.custom_label || schedule.user_peptide?.peptide?.name || "Dose";
    const isGLP1 = schedule.user_peptide?.peptide?.category === "weight-loss";
    const doseLabel =
      isGLP1 && schedule.dose_mcg >= 1000
        ? `${(schedule.dose_mcg / 1000).toFixed(2)} mg`
        : `${schedule.dose_mcg} mcg`;
    const units = getSyringeUnits(schedule);

    for (const rawTime of schedule.times_of_day || []) {
      const time = rawTime.slice(0, 5); // normalize HH:MM:SS -> HH:MM
      const notificationId = `${schedule.id}-${today}-${time}`;

      // Skip if already fired
      if (fired.includes(notificationId)) continue;

      // Skip if already logged
      const isLogged = logs.some((l) => {
        if (l.schedule_id !== schedule.id) return false;
        if (!l.scheduled_at) return false;
        const logTime = new Date(l.scheduled_at);
        const logHHMM = `${String(logTime.getHours()).padStart(2, "0")}:${String(logTime.getMinutes()).padStart(2, "0")}`;
        return logHHMM === time && l.status !== "missed";
      });
      if (isLogged) continue;

      // Calculate target time (today at HH:MM)
      const [h, m] = time.split(":");
      const target = new Date();
      target.setHours(parseInt(h), parseInt(m), 0, 0);
      const delay = target.getTime() - Date.now();

      // Skip past times
      if (delay < 0) continue;

      // Skip times more than 24h away (shouldn't happen but safety)
      if (delay > 24 * 60 * 60 * 1000) continue;

      const timer = setTimeout(() => {
        fireNotification(
          `Time for your ${peptideName}`,
          `${doseLabel}${units > 0 ? ` — Draw ${units} units` : ""}`,
          notificationId,
          () => {
            window.location.href = "/dashboard";
          }
        );
        markFired(notificationId);
      }, delay);

      timers.push(timer);
    }
  }

  return () => {
    timers.forEach((t) => clearTimeout(t));
  };
}
