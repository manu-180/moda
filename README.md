# MAISON ÉLARA

Contemporary luxury fashion e-commerce — designed in Buenos Aires, crafted for the world.

A full-stack Next.js 14 e-commerce platform with a luxury editorial aesthetic, complete admin dashboard, and Supabase backend.

## Stack

- **Next.js 14** — App Router, Server Components, TypeScript
- **Tailwind CSS 3** — Custom luxury design system
- **Framer Motion** — Cinematic animations and transitions
- **Supabase** — Auth, PostgreSQL database, Storage
- **Zustand** — Cart state management with localStorage persistence
- **Recharts** — Admin dashboard charts
- **Embla Carousel** — Product galleries and carousels
- **Lucide React** — Icon system

## Features

### Store Frontend
- Cinematic hero with parallax and word-by-word animation
- Editorial asymmetric product grids
- Product detail with cursor-tracking zoom, quick-add sizes
- Full cart and checkout flow with order creation
- Search overlay with debounced results
- Collection pages with hero headers
- Responsive design (375px → 1920px)

### Admin Dashboard
- Protected routes with Supabase auth + middleware
- Revenue charts, order donut, top products
- Full CRUD: Products, Categories, Collections, Orders
- Inventory management with inline editing and bulk updates
- Settings with key-value storage
- Collapsible sidebar with mobile overlay

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd maison-elara

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Fill in your Supabase project URL and keys

# 4. Setup database
# Go to your Supabase project → SQL Editor
# Paste and run the contents of supabase-schema.sql

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the store.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_SITE_URL` | Site URL for metadata and sitemap |

## Design System

Typography: Bodoni Moda (display) + Inter (body)
Colors: ivory, cream, charcoal, champagne gold, muted red, deep forest
Aesthetic: editorial luxury, no border-radius, fine borders, generous whitespace

## License

Private — All rights reserved.
