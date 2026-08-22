# Scentra Ryv — Store Setup

Luxury perfume e-commerce built on Django + PostgreSQL + Tailwind CSS.

## Quick Start

```powershell
# 1. Start PostgreSQL
docker compose up -d

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install & build Tailwind CSS
npm install
npm run build:css

# 4. Run migrations
python manage.py makemigrations store
python manage.py migrate

# 5. Seed 6 perfume products
python manage.py seed_products

# 6. Create admin user (optional)
python manage.py createsuperuser

# 7. Run server
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` for the storefront and `/admin/` for order management.

## Tailwind CSS

During development, watch for CSS changes:

```powershell
npm run watch:css
```

Production build:

```powershell
npm run build:css
```

## Order email notifications (Gmail)

Orders already trigger an email to `ORDER_NOTIFICATION_EMAIL` (default: `scentraryv@gmail.com`).
If you do **not** get emails, your Gmail App Password is missing.

1. Open [Google App Passwords](https://myaccount.google.com/apppasswords) (2-Step Verification must be ON)
2. Create an app password for “Mail”
3. Put it in `.env`:

```env
EMAIL_HOST_USER=scentraryv@gmail.com
EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx
ORDER_NOTIFICATION_EMAIL=scentraryv@gmail.com
```

4. Restart `python manage.py runserver`

Without `EMAIL_HOST_PASSWORD`, Django only prints emails in the terminal (console backend) — they never reach Gmail.

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `POSTGRES_*` | Database connection |
| `BANK_NAME`, `BANK_ACCOUNT_TITLE`, `BANK_ACCOUNT_NUMBER`, `BANK_IBAN` | Bank transfer details shown at checkout |
| `WHATSAPP_NUMBER` | WhatsApp contact (country code, no +) |
| `SHIPPING_NEARBY_RATE` | Punjab / default shipping (default: 280) |
| `SHIPPING_OTHER_RATE` | Sindh, Balochistan & KPK shipping (default: 350) |

## Logo

Place your logo at `static/images/logo.png` (or update templates to use your file). A placeholder SVG is included at `static/images/logo.svg`.

## Store Features

- Session-based shopping cart
- Cash on Delivery (COD) checkout
- Bank transfer with payment screenshot upload
- Order management in Django Admin with status workflow
- Responsive luxury UI with Swiper sliders and Alpine.js
