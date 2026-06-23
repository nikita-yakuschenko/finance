# ДДС Dashboard

Веб-дашборд на **Next.js + shadcn/ui `dashboard-01` + Recharts**.  
Читает `ДДС.xlsx` из корня проекта, Excel не изменяет.

## Стек

- [shadcn/ui dashboard-01](https://ui.shadcn.com/blocks) — sidebar, KPI cards, area chart, data table
- Данные из `src/lib/excel-parser.ts`

## Запуск

```powershell
cd C:\finance
npm install
npm run sync-data   # скопировать ДДС.xlsx → data/source.xlsx
npm run dev
```

http://localhost:3000

## Добавление блоков shadcn

```powershell
npx shadcn@latest add dashboard-01
npx shadcn@latest add button card chart
```

## API

`GET /api/dashboard` — JSON со всеми метриками.

## Данные

После обновления Excel:

```powershell
npm run sync-data
```

Или напрямую: `$env:EXCEL_PATH = "C:\finance\ДДС.xlsx"`
