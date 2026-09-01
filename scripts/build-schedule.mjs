import { writeFileSync } from "node:fs";
import {
  datesForWeekday,
  datesUntil,
  datesFrom,
  datesBetween,
  everyNth,
} from "../src/weekdays.js";

const term = { start: "2026-09-01", end: "2027-01-08" };
const mon = datesForWeekday(term, 1);
const tue = datesForWeekday(term, 2);
const wed = datesForWeekday(term, 3);
const thu = datesForWeekday(term, 4);
const fri = datesForWeekday(term, 5);

function series(id, dates, start, end, title, kind, place = null) {
  return { id, dates, start, end, title, kind, place };
}

const items = [
  series("mon-lat", mon, "08:00", "09:25", "Лат. яз.", "pair"),
  series("mon-pe", mon, "11:35", "13:00", "Физ-ра", "pair"),
  series("mon-lang", mon, "13:10", "14:35", "Ин. яз.", "pair"),
  series("mon-bioorg", mon, "14:45", "16:10", "Биоорг. хим.", "pair"),
  series(
    "mon-lec-math",
    everyNth(mon, 0, 2),
    "10:25",
    "11:25",
    "Мат и ОИЗП",
    "lecture",
    "к. 18, ауд. 101",
  ),
  series(
    "mon-lec-medbio",
    everyNth(mon, 1, 2),
    "10:25",
    "11:25",
    "Мед. биология",
    "lecture",
    "к. 18, ауд. 101",
  ),

  series("tue-bjch-ot", everyNth(tue, 0, 2), "10:30", "11:55", "БЖЧ (ОТ)", "pair"),
  series("tue-bjch-oz", everyNth(tue, 1, 2), "10:30", "11:55", "БЖЧ (ОЗ)", "pair"),
  series(
    "tue-polit",
    datesUntil(term, 2, "2026-11-17"),
    "13:00",
    "14:25",
    "Совр. политэк.",
    "pair",
  ),
  series(
    "tue-hist",
    [
      ...datesUntil(term, 2, "2026-09-29"),
      "2026-10-20",
      "2026-11-24",
      "2026-12-08",
    ],
    "14:50",
    "17:50",
    "Гист.",
    "pair",
  ),
  series(
    "tue-anat",
    [
      ...datesBetween(2, "2026-10-06", "2026-10-13"),
      ...datesBetween(2, "2026-10-27", "2026-11-17"),
      "2026-12-29",
    ],
    "14:50",
    "17:50",
    "Анат. чел.",
    "pair",
  ),

  series("wed-medbio", wed, "10:30", "12:45", "Мед. биология", "pair"),
  series("wed-math", wed, "15:30", "17:45", "Мат и ОИЗП", "pair"),
  series(
    "wed-lec-ibg",
    datesUntil(term, 3, "2026-12-02"),
    "13:30",
    "14:30",
    "ИБГ",
    "lecture",
    "к. 15, ауд. 107",
  ),

  series("thu-biophys", thu, "09:40", "11:05", "Мед. и биофизика", "pair"),
  series("thu-info", thu, "11:20", "12:45", "Информ. в мед.", "pair"),
  series("thu-lang", thu, "15:30", "16:55", "Ин. яз.", "pair"),
  series(
    "thu-lec-bioorg",
    ["2026-09-03", "2026-10-08", "2026-10-29", "2026-11-12"],
    "13:10",
    "14:10",
    "Биоорг. хим.",
    "lecture",
    "к. 1, ауд. 2",
  ),
  series(
    "thu-lec-polit-a",
    ["2026-09-10", "2026-10-15"],
    "13:10",
    "14:10",
    "Совр. политэк.",
    "lecture",
    "к. 1, ауд. 2",
  ),
  series(
    "thu-lec-biophys",
    ["2026-09-24", "2026-10-22"],
    "13:10",
    "14:10",
    "Мед. и биофизика",
    "lecture",
    "к. 1, ауд. 2",
  ),
  series(
    "thu-lec-bjch",
    ["2026-09-17", "2026-10-01"],
    "13:10",
    "15:20",
    "БЖЧ (ОТ)",
    "lecture",
    "к. 1, ауд. 2",
  ),
  series("thu-pe-stad", ["2026-09-03"], "14:20", "15:20", "Физ-ра", "lecture", "Стадион"),
  series(
    "thu-lec-hist",
    ["2026-09-10", "2026-10-15"],
    "14:20",
    "15:20",
    "Гист.",
    "lecture",
    "к. 1, ауд. 2",
  ),
  series(
    "thu-lec-polit-b",
    ["2026-09-24", "2026-10-08", "2026-10-22", "2026-10-29", "2026-11-12"],
    "14:20",
    "15:20",
    "Совр. политэк.",
    "lecture",
    "к. 1, ауд. 2",
  ),

  series("fri-lang", ["2026-12-18"], "08:00", "09:25", "Ин. яз.", "pair"),
  series("fri-pe-newyear", ["2027-01-01"], "08:50", "11:05", "Физ-ра", "pair"),
  series("fri-pe-from", datesFrom(term, 5, "2026-09-11"), "09:35", "11:00", "Физ-ра", "pair"),
  series("fri-ibg", datesUntil(term, 5, "2026-12-11"), "11:20", "12:45", "ИБГ", "pair"),
  series("fri-medchem", datesUntil(term, 5, "2027-01-01"), "13:05", "15:20", "Мед. хим.", "pair"),
  series(
    "fri-lec-bjch-oz",
    ["2026-09-04", "2026-09-18", "2026-09-25", "2026-10-16"],
    "08:25",
    "09:25",
    "БЖЧ (ОЗ)",
    "lecture",
    "к. 15, ауд. 109",
  ),
  series(
    "fri-lec-medchem",
    ["2026-09-11", "2026-10-09", "2026-10-30", "2026-11-06"],
    "08:25",
    "09:25",
    "Мед. хим.",
    "lecture",
    "к. 15, ауд. 109",
  ),
  series(
    "fri-lec-anat",
    ["2026-10-02", "2026-11-13"],
    "08:25",
    "09:25",
    "Анат. чел.",
    "lecture",
    "к. 15, ауд. 109",
  ),
  series(
    "fri-lec-polit",
    ["2026-10-23"],
    "08:25",
    "09:25",
    "Совр. политэк.",
    "lecture",
    "к. 15, ауд. 109",
  ),
  series("fri-pe-stad", ["2026-09-04"], "09:40", "10:40", "Физ-ра", "lecture", "Стадион"),
];

for (const s of items) {
  s.dates = [...new Set(s.dates)].sort();
}

const schedule = {
  group: "7108",
  timezone: "Europe/Minsk",
  term,
  session: { start: "2027-01-11", end: "2027-01-24" },
  vacation: { start: "2027-01-25", end: "2027-02-07" },
  series: items,
};

writeFileSync(new URL("../public/schedule.json", import.meta.url), JSON.stringify(schedule, null, 2) + "\n");
console.log("series", items.length, "events", items.reduce((n, s) => n + s.dates.length, 0));
