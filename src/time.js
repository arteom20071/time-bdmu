export const TZ = "Europe/Minsk";

const WEEKDAY = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

const partsFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});

function bag(date) {
  const out = {};
  for (const p of partsFmt.formatToParts(date)) {
    if (p.type !== "literal") out[p.type] = p.value;
  }
  return out;
}

export function minskParts(date) {
  const p = bag(date);
  const minutes = Number(p.hour) * 60 + Number(p.minute);
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour}:${p.minute}`,
    minutes,
    weekday: WEEKDAY[p.weekday],
  };
}

export function hmToMinutes(hm) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

export function formatClock(date) {
  return minskParts(date).time;
}
