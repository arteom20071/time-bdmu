import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  eventsOn,
  nowEvents,
  nextEvent,
  weekOf,
  shiftWeek,
  cardStatus,
} from "../src/resolver.js";

const fixture = {
  timezone: "Europe/Minsk",
  term: { start: "2026-09-01", end: "2027-01-08" },
  series: [
    {
      id: "bjch-ot",
      dates: ["2026-09-01", "2026-09-15"],
      start: "10:30",
      end: "11:55",
      title: "БЖЧ (ОТ)",
      kind: "pair",
      place: null,
    },
    {
      id: "bjch-oz",
      dates: ["2026-09-08"],
      start: "10:30",
      end: "11:55",
      title: "БЖЧ (ОЗ)",
      kind: "pair",
      place: null,
    },
    {
      id: "hist-lec",
      dates: ["2026-09-10"],
      start: "14:20",
      end: "15:20",
      title: "Гист.",
      kind: "lecture",
      place: "к. 1, ауд. 2",
    },
    {
      id: "hist-pair",
      dates: ["2026-09-01"],
      start: "10:25",
      end: "11:25",
      title: "Гист.",
      kind: "lecture",
      place: "к. 1, ауд. 2",
    },
  ],
};

test("OT Tuesday is БЖЧ (ОТ), OZ Tuesday is БЖЧ (ОЗ)", () => {
  const ot = eventsOn(fixture, "2026-09-01").filter((e) => e.start === "10:30");
  assert.equal(ot.length, 1);
  assert.equal(ot[0].title, "БЖЧ (ОТ)");
  const oz = eventsOn(fixture, "2026-09-08").filter((e) => e.start === "10:30");
  assert.equal(oz[0].title, "БЖЧ (ОЗ)");
});

test("lecture exists only on listed dates", () => {
  assert.equal(eventsOn(fixture, "2026-09-10").some((e) => e.id.startsWith("hist-lec")), true);
  assert.equal(eventsOn(fixture, "2026-09-17").some((e) => e.id.startsWith("hist-lec")), false);
});

test("nowEvents is half-open [start, end)", () => {
  const during = new Date("2026-09-01T08:30:00Z"); // 11:30 Minsk, lecture already ended
  assert.equal(nowEvents(fixture, during).length, 1);
  assert.equal(nowEvents(fixture, during)[0].title, "БЖЧ (ОТ)");
  const atEnd = new Date("2026-09-01T08:55:00Z"); // 11:55 Minsk
  assert.equal(nowEvents(fixture, atEnd).length, 0);
});

test("overlapping events both appear in now", () => {
  const overlap = new Date("2026-09-01T07:30:00Z"); // 10:30 Minsk
  const titles = nowEvents(fixture, overlap).map((e) => e.title).sort();
  assert.deepEqual(titles, ["БЖЧ (ОТ)", "Гист."]);
  const card = cardStatus(fixture, overlap);
  assert.equal(card.status, "now");
  assert.equal(card.current.length, 2);
  assert.equal(card.interval.start, "10:25");
  assert.equal(card.interval.end, "11:55");
});

test("nextEvent after a class end", () => {
  const after = new Date("2026-09-01T08:55:00Z"); // 11:55
  assert.equal(nextEvent(fixture, after).id, "bjch-oz:2026-09-08");
});

test("Saturday and Sunday select the next Mon–Fri week", () => {
  assert.equal(weekOf("2026-09-04").monday, "2026-08-31");
  assert.equal(weekOf("2026-09-05").monday, "2026-09-07");
  assert.equal(weekOf("2026-09-06").monday, "2026-09-07");
  assert.deepEqual(weekOf("2026-09-07").days, [
    "2026-09-07",
    "2026-09-08",
    "2026-09-09",
    "2026-09-10",
    "2026-09-11",
  ]);
});

test("shiftWeek stops at term bounds", () => {
  const first = weekOf("2026-09-01");
  assert.equal(shiftWeek(first, -1, fixture.term), null);
  const last = weekOf("2027-01-08");
  assert.equal(shiftWeek(last, 1, fixture.term), null);
  assert.equal(shiftWeek(first, 1, fixture.term).monday, "2026-09-07");
});

test("after term.end card is none with empty next", () => {
  const card = cardStatus(fixture, new Date("2027-01-09T12:00:00+03:00"));
  assert.equal(card.status, "none");
  assert.equal(card.next, null);
  assert.equal(card.remainingMinutes, null);
});

test("after the last class today status is none but next remains", () => {
  const card = cardStatus(fixture, new Date("2026-09-01T08:55:00Z")); // 11:55 Minsk
  assert.equal(card.status, "none");
  assert.equal(card.next.id, "bjch-oz:2026-09-08");
});

test("before first class status is next with countdown", () => {
  const card = cardStatus(fixture, new Date("2026-09-01T06:00:00Z")); // 09:00 Minsk
  assert.equal(card.status, "next");
  assert.equal(card.next.title, "Гист.");
  assert.equal(card.remainingMinutes, 85);
  assert.equal(card.breakMinutes, null);
});

test("between today's classes reports the full break", () => {
  const withGap = {
    ...fixture,
    series: [
      ...fixture.series,
      {
        id: "later",
        dates: ["2026-09-01"],
        start: "13:10",
        end: "14:35",
        title: "Гист.",
        kind: "pair",
        place: null,
      },
    ],
  };
  const card = cardStatus(withGap, new Date("2026-09-01T09:00:00Z")); // 12:00 Minsk
  assert.equal(card.status, "next");
  assert.equal(card.next.start, "13:10");
  assert.equal(card.breakMinutes, 75);
  assert.equal(card.remainingMinutes, 70);
});

const schedule = JSON.parse(
  readFileSync(new URL("../public/schedule.json", import.meta.url), "utf8"),
);

test("production Tuesday 2026-09-01 10:30 is БЖЧ (ОТ) not ОЗ", () => {
  const hit = eventsOn(schedule, "2026-09-01").filter((e) => e.start === "10:30" && e.kind === "pair");
  assert.equal(hit.length, 1);
  assert.equal(hit[0].title, "БЖЧ (ОТ)");
});

test("production has no events after term.end", () => {
  assert.equal(eventsOn(schedule, "2027-01-09").length, 0);
});
