import assert from "node:assert/strict";
import test from "node:test";
import { minskParts, hmToMinutes, formatClock, formatDuration } from "../src/time.js";

test("minskParts uses Europe/Minsk not the machine offset", () => {
  const utc = new Date("2026-09-01T08:02:00Z");
  const p = minskParts(utc);
  assert.equal(p.date, "2026-09-01");
  assert.equal(p.time, "11:02");
  assert.equal(p.minutes, 11 * 60 + 2);
  assert.equal(p.weekday, 2);
});

test("minskParts maps Sunday to ISO 7", () => {
  const p = minskParts(new Date("2026-09-06T12:00:00+03:00"));
  assert.equal(p.date, "2026-09-06");
  assert.equal(p.weekday, 7);
});

test("hmToMinutes parses HH:MM", () => {
  assert.equal(hmToMinutes("00:00"), 0);
  assert.equal(hmToMinutes("10:30"), 630);
  assert.equal(hmToMinutes("23:59"), 23 * 60 + 59);
});

test("formatClock is HH:MM in Minsk", () => {
  assert.equal(formatClock(new Date("2026-09-01T08:02:00Z")), "11:02");
});

test("formatDuration spells hours and minutes in Russian", () => {
  assert.equal(formatDuration(12), "12 мин");
  assert.equal(formatDuration(60), "1 ч");
  assert.equal(formatDuration(75), "1 ч 15 мин");
});
