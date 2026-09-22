# Группа 7108

Живое расписание: текущая или следующая пара по времени Минска, список на сегодня и столбик недели.

**Сайт:** https://arteom20071.github.io/time-bdmu/

Хостинг — GitHub Pages (HTTPS автоматически).

## Локально

```bash
npm test
python3 -m http.server 4173 --directory .
```

Открой http://127.0.0.1:4173/public/

## Данные

Расписание — `public/schedule.json`. Пересборка дат:

```bash
node scripts/build-schedule.mjs
```

Пример nginx для своего VPS — в `deploy/nginx.conf.example` (не обязателен при Pages).
