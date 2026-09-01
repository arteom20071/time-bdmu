import assert from "node:assert/strict";
import test from "node:test";
import { datesForWeekday } from "../src/weekdays.js";

const term = { start: "2026-09-01", end: "2026-09-14" };

test("datesForWeekday lists Mondays in range inclusive", () => {
  assert.deepEqual(datesForWeekday(term, 1), ["2026-09-07", "2026-09-14"]);
});
