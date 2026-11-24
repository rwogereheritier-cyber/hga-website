// Availability is defined in Hetty's time zone and shown in the visitor's own.
// TODO: confirm Hetty's city, working hours and holidays with the client.
export const HOST_TZ = 'America/Toronto';
const HOLIDAYS = ['2026-12-24', '2026-12-25', '2026-12-26', '2026-12-31', '2027-01-01'];
const DEFAULT_AVAILABILITY = { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotMinutes: 90, minNoticeHours: 24, maxAdvanceDays: 60 };

/** Start times (hour, minute) for one day, from the booking hours in Settings. */
function dayStarts({ start, end, slotMinutes }, sessionMinutes = 45) {
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  const out = [];
  for (let m = toMin(start); m + sessionMinutes <= toMin(end); m += slotMinutes) out.push([Math.floor(m / 60), m % 60]);
  return out;
}

const pad = (n) => String(n).padStart(2, '0');

function partsIn(ms, tz) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return Object.fromEntries(fmt.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
}

function offsetMs(ms, tz) {
  const p = partsIn(ms, tz);
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
}

/** UTC timestamp for a wall-clock time in a given time zone. */
export function zonedToUtc(y, m, d, h, min, tz) {
  const guess = Date.UTC(y, m, d, h, min);
  const first = offsetMs(guess, tz);
  const ts = guess - first;
  const second = offsetMs(ts, tz);
  return second === first ? ts : guess - second;
}

/** Local (visitor) calendar key, e.g. 2026-12-03. */
export const localKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** All bookable slots for the next weeks, grouped by the visitor's local date. */
export function buildSlots(takenMs = [], availability = DEFAULT_AVAILABILITY, tz = HOST_TZ, sessionMinutes = 45) {
  const av = { ...DEFAULT_AVAILABILITY, ...availability };
  const now = Date.now();
  const earliest = now + av.minNoticeHours * 3600000;
  const today = partsIn(now, tz);
  const taken = new Set(takenMs);
  const starts = dayStarts(av, sessionMinutes);
  const byDay = {};
  for (let i = 0; i <= av.maxAdvanceDays; i++) {
    const day = new Date(Date.UTC(+today.year, +today.month - 1, +today.day + i));
    const dow = day.getUTCDay();
    const hostKey = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;
    if (!av.days.includes(dow) || HOLIDAYS.includes(hostKey)) continue;
    for (const [h, min] of starts) {
      const ms = zonedToUtc(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, min, tz);
      if (ms < earliest) continue;
      // Demo: about one slot in five already taken, plus anything booked in this browser.
      const demoTaken = Math.floor(ms / 1800000) % 5 === 0;
      const key = localKey(new Date(ms));
      (byDay[key] ||= []).push({ ms, taken: demoTaken || taken.has(ms) });
    }
  }
  Object.values(byDay).forEach((list) => list.sort((a, b) => a.ms - b.ms));
  return byDay;
}

export function visitorZoneLabel() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time zone';
  const offset =
    new Intl.DateTimeFormat('en-US', { timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value || '';
  const city = tz.split('/').pop().replace(/_/g, ' ');
  return `${city} (${offset})`;
}

export const fmtTime = (ms) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
export const fmtDate = (ms, opts = {}) =>
  new Date(ms).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', ...opts });
export const fmtLongDate = (ms) =>
  new Date(ms).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** iCalendar UTC stamp: 20261203T143000Z */
export function icsStamp(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}00Z`;
}
