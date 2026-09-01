import { minskParts } from "./time.js";

const MSK = "+03:00";

function nextDate(dateStr) {
  const dt = new Date(`${dateStr}T12:00:00${MSK}`);
  dt.setUTCDate(dt.getUTCDate() + 1);
  return minskParts(dt).date;
}

export function datesForWeekday(term, isoWeekday) {
  const out = [];
  for (let d = term.start; d <= term.end; d = nextDate(d)) {
    const wd = minskParts(new Date(`${d}T12:00:00${MSK}`)).weekday;
    if (wd === isoWeekday) out.push(d);
  }
  return out;
}

export function datesUntil(term, isoWeekday, until) {
  const end = until < term.end ? until : term.end;
  return datesForWeekday({ start: term.start, end }, isoWeekday);
}

export function datesFrom(term, isoWeekday, from) {
  const start = from > term.start ? from : term.start;
  return datesForWeekday({ start, end: term.end }, isoWeekday);
}

export function datesBetween(isoWeekday, start, end) {
  return datesForWeekday({ start, end }, isoWeekday);
}

export function everyNth(dates, offset, n = 2) {
  return dates.filter((_, i) => i % n === offset);
}
