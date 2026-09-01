# Группа 7108

Живое расписание: текущая или следующая пара по времени Минска, список на сегодня и столбик недели.

## Локально

```bash
npm test
python3 -m http.server 4173 --directory .
```

Открой http://127.0.0.1:4173/public/

## HTTPS на своём VPS

1. Скопируй репозиторий в `/var/www/time-bdmu`.
2. Подставь свой домен вместо `example.com` в `deploy/nginx.conf.example` и путь, если другой.
3. Первый выпуск сертификата (HTTP-only, пока нет файлов Let's Encrypt):

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/time-bdmu;
    location / { try_files $uri $uri/ /public/index.html; }
    location /public/ { alias /var/www/time-bdmu/public/; }
    location /src/ { alias /var/www/time-bdmu/src/; }
}
```

4. Выпусти сертификат:

```bash
sudo certbot --nginx -d example.com
```

Certbot сам допишет SSL и поставит systemd-таймер обновления.

5. После этого можно включить полный пример из `deploy/nginx.conf.example` (редирект 80→443 и HSTS).

Проверка: `curl -I https://example.com` — 200, не предупреждение о сертификате.

Секреты и приватные ключи в репозиторий не кладутся.

## Данные

Расписание — `public/schedule.json`. Исходное фото — `docs/schedule-source.png`. Пересборка дат:

```bash
node scripts/build-schedule.mjs
```
