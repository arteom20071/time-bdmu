import { hmToMinutes, minskParts } from "./time.js";

const MSK = "+03:00";

function minskInstant(dateStr, hm) {
  return new Date(`${dateStr}T${hm}:00${MSK}`);
}

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T12:00:00${MSK}`);
  d.setUTCDate(d.getUTCDate() + n);
  return minskParts(d).date;
}

function cmpEvent(a, b) {
  return a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.title.localeCompare(b.title, "ru");
}

export function flatten(schedule) {
  if (schedule.events?.length && !schedule.series) {
    return [...schedule.events].sort(cmpEvent);
  }
  const out = [];
  for (const s of schedule.series ?? []) {
    for (const date of s.dates) {
      out.push({
        id: `${s.id}:${date}`,
        date,
        start: s.start,
        end: s.end,
        title: s.title,
        kind: s.kind,
        place: s.place ?? null,
      });
    }
  }
  if (schedule.events?.length) out.push(...schedule.events);
  return out.sort(cmpEvent);
}

export function eventsOn(schedule, dateStr) {
  return flatten(schedule).filter((e) => e.date === dateStr);
}

export function nowEvents(schedule, instant) {
  const { date, minutes } = minskParts(instant);
  return eventsOn(schedule, date).filter((e) => {
    const start = hmToMinutes(e.start);
    const end = hmToMinutes(e.end);
    return start <= minutes && minutes < end;
  });
}

export function nextEvent(schedule, instant) {
  const { date, minutes } = minskParts(instant);
  const upcoming = flatten(schedule).filter((e) => {
    if (e.date > date) return true;
    if (e.date < date) return false;
    return hmToMinutes(e.start) > minutes;
  });
  return upcoming[0] ?? null;
}

export function weekOf(dateStr) {
  const { weekday } = minskParts(new Date(`${dateStr}T12:00:00${MSK}`));
  let monday = dateStr;
  if (weekday >= 6) {
    monday = addDays(dateStr, 8 - weekday);
  } else {
    monday = addDays(dateStr, 1 - weekday);
  }
  const days = [0, 1, 2, 3, 4].map((i) => addDays(monday, i));
  return { monday: days[0], days };
}

function intersectsTerm(days, term) {
  return days.some((d) => d >= term.start && d <= term.end);
}

export function shiftWeek(week, delta, term) {
  const monday = addDays(week.monday, 7 * delta);
  const next = weekOf(monday);
  if (!intersectsTerm(next.days, term)) return null;
  return next;
}

export function cardStatus(schedule, instant) {
  const current = nowEvents(schedule, instant);
  const next = nextEvent(schedule, instant);
  if (current.length) {
    const starts = current.map((e) => e.start).sort();
    const ends = current.map((e) => e.end).sort();
    const interval = { start: starts[0], end: ends[ends.length - 1] };
    const remainingMs = minskInstant(current[0].date, interval.end) - instant;
    return {
      status: "now",
      current,
      next,
      remainingMinutes: Math.max(0, Math.floor(remainingMs / 60000)),
      interval,
    };
  }
  if (next && next.date === minskParts(instant).date) {
    const remainingMs = minskInstant(next.date, next.start) - instant;
    return {
      status: "next",
      current: [],
      next,
      remainingMinutes: Math.max(0, Math.floor(remainingMs / 60000)),
      interval: null,
    };
  }
  return {
    status: "none",
    current: [],
    next,
    remainingMinutes: null,
    interval: null,
  };
}
