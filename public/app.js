import { formatClock, hmToMinutes, minskParts } from "../src/time.js";
import { cardStatus, eventsOn, nowEvents, shiftWeek, weekOf } from "../src/resolver.js";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const DAYS = ["", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const els = {
  clock: document.getElementById("clock"),
  status: document.getElementById("status"),
  list: document.getElementById("today-list"),
  viewport: document.getElementById("viewport"),
  track: document.getElementById("track"),
  pageToday: document.getElementById("page-today"),
  tabs: [...document.querySelectorAll(".tab")],
  weekPrev: document.getElementById("week-prev"),
  weekNext: document.getElementById("week-next"),
  weekLabel: document.getElementById("week-label"),
  weekStack: document.getElementById("week-stack"),
  weekTrack: document.getElementById("week-track"),
};

let schedule;
let tab = 0;
let week;
let lastDate = "";
let dragging = false;
let startX = 0;
let startT = 0;
let dx = 0;

function weekdayOf(dateStr) {
  return minskParts(new Date(`${dateStr}T12:00:00+03:00`)).weekday;
}

function prettyDate(dateStr) {
  const [, m, d] = dateStr.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}

function eventLine(event) {
  const place = event.kind === "lecture" && event.place ? ` · ${event.place}` : "";
  return `${event.title}${place}`;
}

function renderStatus(instant) {
  const card = cardStatus(schedule, instant);
  const compactLeft = els.status.classList.contains("is-compact");
  els.status.classList.toggle("is-quiet", card.status !== "now");
  if (card.status === "now") {
    const names = card.current.map((e) => e.title).join(" · ");
    els.status.innerHTML = `
      <p class="slab-kicker">Сейчас · ещё ${card.remainingMinutes} мин</p>
      <h1 class="slab-title">${names}${compactLeft ? `<span class="slab-time">ещё ${card.remainingMinutes} мин</span>` : ""}</h1>
      <p class="slab-time">${card.interval.start}–${card.interval.end}</p>
    `;
    return;
  }
  if (card.status === "next") {
    els.status.innerHTML = `
      <p class="slab-kicker">Дальше · через ${card.remainingMinutes} мин</p>
      <h1 class="slab-title">${card.next.title}</h1>
      <p class="slab-meta">в ${card.next.start}</p>
    `;
    return;
  }
  if (card.next) {
    els.status.innerHTML = `
      <p class="slab-kicker">Пар нет</p>
      <h1 class="slab-title">${card.next.title}</h1>
      <p class="slab-meta">${prettyDate(card.next.date)} · ${card.next.start}</p>
    `;
    return;
  }
  els.status.innerHTML = `
    <p class="slab-kicker">Сегодня</p>
    <h1 class="slab-title">Пар нет</h1>
  `;
}

function renderTodayList(instant) {
  const { date } = minskParts(instant);
  const nowIds = new Set(nowEvents(schedule, instant).map((e) => e.id));
  const minutes = minskParts(instant).minutes;
  const events = eventsOn(schedule, date);
  els.list.innerHTML = events
    .map((event, i) => {
      const end = hmToMinutes(event.end);
      const cls = nowIds.has(event.id) ? "is-now" : minutes >= end ? "is-past" : "is-future";
      const place = event.kind === "lecture" && event.place ? `<span class="row-place">${event.place}</span>` : "";
      return `<li class="row ${cls}" style="--i:${Math.min(i, 4)}"><span class="row-time">${event.start}</span><span>${event.title}${place}</span></li>`;
    })
    .join("");
  if (!events.length) els.list.innerHTML = "";
}

function renderWeek(instant) {
  const today = minskParts(instant).date;
  const [, m1] = week.days[0].split("-");
  const [, m2, d2] = week.days[4].split("-");
  els.weekLabel.textContent =
    m1 === m2 ? `${Number(week.days[0].slice(8))}–${Number(d2)} ${MONTHS[Number(m2) - 1]}` : `${prettyDate(week.days[0])} – ${prettyDate(week.days[4])}`;
  els.weekStack.innerHTML = week.days
    .map((dateStr) => {
      const wd = weekdayOf(dateStr);
      const isToday = dateStr === today;
      const events = eventsOn(schedule, dateStr);
      const rows = events
        .map((event) => `<p class="row"><span class="row-time">${event.start}</span><span>${eventLine(event)}</span></p>`)
        .join("");
      const todayMark = isToday ? " · сегодня" : ` · ${prettyDate(dateStr)}`;
      return `<section class="day${isToday ? " is-today" : ""}" data-date="${dateStr}"><h2 class="day-name">${DAYS[wd]}${todayMark}</h2>${rows}</section>`;
    })
    .join("");
  els.weekPrev.disabled = !shiftWeek(week, -1, schedule.term);
  els.weekNext.disabled = !shiftWeek(week, 1, schedule.term);
}

function scrollTodayIntoWeek() {
  const today = minskParts(new Date()).date;
  const node = els.weekStack.querySelector(`[data-date="${today}"]`) || els.weekStack.querySelector(".day");
  node?.scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
}

function setTab(next, { animate = true } = {}) {
  tab = next;
  els.tabs.forEach((btn, i) => btn.classList.toggle("is-on", i === tab));
  const x = tab === 0 ? 0 : -50;
  if (!animate || reduceMotion()) {
    els.track.style.transition = "none";
    els.track.style.transform = `translateX(${x}%)`;
  } else {
    els.track.style.transition = `transform 320ms ${EASE}`;
    els.track.style.transform = `translateX(${x}%)`;
  }
  if (tab === 1) requestAnimationFrame(scrollTodayIntoWeek);
}

function tick() {
  const instant = new Date();
  const parts = minskParts(instant);
  els.clock.textContent = formatClock(instant);
  if (parts.date !== lastDate) {
    lastDate = parts.date;
    week = weekOf(parts.date);
    renderWeek(instant);
  }
  renderStatus(instant);
  renderTodayList(instant);
}

function bindSwipe() {
  let armed = false;
  let startY = 0;

  const onDown = (x, y) => {
    armed = true;
    dragging = false;
    startX = x;
    startY = y;
    startT = performance.now();
    dx = 0;
  };
  const onMove = (x, y, event) => {
    if (!armed) return;
    const mx = x - startX;
    const my = y - startY;
    if (!dragging) {
      if (Math.abs(my) > 10 && Math.abs(my) >= Math.abs(mx)) {
        armed = false;
        return;
      }
      if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my)) {
        dragging = true;
        els.track.style.transition = "none";
        event?.preventDefault();
      } else {
        return;
      }
    }
    dx = mx;
    const width = els.viewport.clientWidth;
    const base = tab === 0 ? 0 : -width;
    els.track.style.transform = `translateX(${base + dx}px)`;
  };
  const onUp = () => {
    if (!armed && !dragging) return;
    armed = false;
    if (!dragging) return;
    dragging = false;
    const width = els.viewport.clientWidth;
    const dt = Math.max(1, performance.now() - startT);
    const velocity = dx / dt;
    const shouldFlip = Math.abs(dx) > width * 0.35 || Math.abs(velocity) > 0.6;
    if (shouldFlip && dx < 0 && tab === 0) setTab(1);
    else if (shouldFlip && dx > 0 && tab === 1) setTab(0);
    else setTab(tab);
  };

  els.viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    onDown(e.clientX, e.clientY);
  });
  els.viewport.addEventListener(
    "pointermove",
    (e) => {
      onMove(e.clientX, e.clientY, e);
    },
    { passive: false },
  );
  els.viewport.addEventListener("pointerup", onUp);
  els.viewport.addEventListener("pointercancel", onUp);
}

function slideWeek(delta) {
  const next = shiftWeek(week, delta, schedule.term);
  if (!next) return;
  if (reduceMotion()) {
    week = next;
    renderWeek(new Date());
    return;
  }
  const dir = delta > 0 ? -1 : 1;
  els.weekTrack.style.transition = `transform 320ms ${EASE}`;
  els.weekTrack.style.transform = `translateX(${dir * 24}px)`;
  els.weekTrack.addEventListener(
    "transitionend",
    () => {
      week = next;
      renderWeek(new Date());
      els.weekTrack.style.transition = "none";
      els.weekTrack.style.transform = `translateX(${-dir * 16}px)`;
      requestAnimationFrame(() => {
        els.weekTrack.style.transition = `transform 320ms ${EASE}`;
        els.weekTrack.style.transform = "translateX(0)";
      });
    },
    { once: true },
  );
}

els.pageToday.addEventListener("scroll", () => {
  els.status.classList.toggle("is-compact", els.pageToday.scrollTop > 24);
  tick();
});

els.tabs.forEach((btn) => btn.addEventListener("click", () => setTab(Number(btn.dataset.tab))));
els.weekPrev.addEventListener("click", () => slideWeek(-1));
els.weekNext.addEventListener("click", () => slideWeek(1));

const data = await fetch("./schedule.json").then((r) => r.json());
schedule = data;
week = weekOf(minskParts(new Date()).date);
bindSwipe();
setTab(0, { animate: false });
tick();
setInterval(tick, 1000);
