# MoodFlow — Social Sentiment Analysis

Frontend-приложение для анализа тональности комментариев и реакции аудитории по ссылкам на YouTube и Telegram.

## Проекты

- Frontend: [Frontend-social-sentiment-analysis](https://github.com/BekowDev/Frontend-social-sentiment-analysis)
- Backend API: [API-social-sentiment-analysis](https://github.com/BekowDev/API-social-sentiment-analysis)
- Live demo: [frontend-social-sentiment-analysis.vercel.app](https://frontend-social-sentiment-analysis.vercel.app/)

## Возможности

- запуск анализа публикации по ссылке;
- просмотр статистики по позитивным, негативным, нейтральным и токсичным комментариям;
- визуализация результатов, метрик и ключевых тем;
- история анализов и отслеживание статуса задач;
- русская, английская и казахская локализации;
- гостевой режим с демонстрационными данными без backend.

## Технологии

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Chart.js
- Tailwind CSS
- Vue I18n

## Требования

- Node.js `^20.19.0` или `>=22.12.0`
- npm
- [Backend API](https://github.com/BekowDev/API-social-sentiment-analysis), MongoDB, Redis и ключ Gemini API для настоящего анализа

## Установка и запуск

```bash
npm install
npm run dev
```

Откройте адрес, указанный Vite в терминале (обычно `http://localhost:5173`).

## Демо-режим

Для запуска без backend создайте в корне проекта файл `.env`:

```env
VITE_USE_MOCK=true
```

Перезапустите сервер разработки после изменения `.env`. В режиме mock можно войти как гость и просматривать результаты анализа на демонстрационных данных. В качестве примера используется ссылка:

```text
https://www.youtube.com/watch?v=QChxpOUxLDY
```

Демо не выполняет настоящий анализ ссылки: данные формируются frontend-приложением.

## Подключение backend

Для настоящих запросов удалите `VITE_USE_MOCK` или установите `VITE_USE_MOCK=false`, затем укажите адрес API в `.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT_MS=60000
```

Если backend запущен на другом адресе или порту, задайте актуальный URL. Frontend API и backend должны быть доступны друг другу; backend также должен быть настроен с MongoDB, Redis и нужными внешними API-ключами.

## Сборка

```bash
npm run build
```

Для локального просмотра production-сборки:

```bash
npm run preview
```
