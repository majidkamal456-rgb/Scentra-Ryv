# Scentra Ryv — Next.js Storefront

Frontend for [scentraryv.pk](https://scentraryv.pk). Django remains the backend (admin, products DB, checkout API).

## Run locally

**Terminal 1 — Django API**

```powershell
cd D:\startup
.\.venv\Scripts\Activate.ps1
docker compose up -d
python manage.py runserver
```

**Terminal 2 — Next.js**

```powershell
cd D:\startup\frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API used by Next.js

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/store/products/` | Product list |
| GET | `/api/store/products/<slug>/` | Product detail |
| GET | `/api/store/config/` | WhatsApp, shipping, bank |
| POST | `/api/store/checkout/` | Place order |
| GET | `/api/store/orders/<order_number>/` | Order confirmation |
| POST | `/api/store/returns/` | Return request |

Cart is stored in the browser (`localStorage`). Checkout posts items to Django.

## Env

`NEXT_PUBLIC_API_URL` — Django origin (default `http://127.0.0.1:8000`).
