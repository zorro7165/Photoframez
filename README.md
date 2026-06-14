# 🖼️ Ritwika's Custom Photo Frame Store

A fully functional e-commerce web application for customizing and ordering premium photo frames directly from images discovered on Instagram.

## ✨ Features

### Customer Features
- **Instagram Integration** - Each post contains a unique Frame ID (e.g., `FRM1023`). Clicking the link opens the customizer with the exact image loaded.
- **Real-time Frame Customizer** - Choose size, material, glass type, border, orientation & quantity with instant price updates.
- **2D Frame Preview** - Realistic rendering with wood grain textures, glass reflections, and shadow effects.
- **Wall Visualization** - See your frame mounted on walls in 3 room environments (Living Room, Bedroom, Office).
- **Full-screen Preview** - Zoom into HD print details.
- **Persistent Shopping Cart** - Cart saves between browser sessions via localStorage.
- **Secure Checkout** - Shipping form with Razorpay payment simulation (UPI/Cards/Net Banking/COD).
- **Order Tracking** - Real-time status timeline (Placed → Confirmed → Printing → Framing → Shipped → Delivered).
- **PDF Invoice Download** - Client-side generated professional invoices via jsPDF.

### Admin Features
- **Analytics Dashboard** - Revenue, orders, conversion rates, best-sellers, Instagram traffic sources.
- **Order Management** - View all orders, update statuses via dropdown (triggers notifications).
- **Image Catalog CRUD** - Upload new artwork with auto-generated sequential Frame IDs.
- **Notification Logs** - Audit trail of all simulated email & WhatsApp notifications.

### Technical Features
- **Dynamic SEO** - Unique meta titles, descriptions, Open Graph & Twitter Cards per frame.
- **Responsive Design** - Mobile-first with premium glassmorphism & micro-animations.
- **Dual Database Support** - SQLite for local dev, PostgreSQL (Neon) for production.
- **Mock Integration Layer** - Razorpay, Resend Email, WhatsApp API all work in mock mode and are production-ready with real API keys.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | Prisma 7 ORM + SQLite / PostgreSQL |
| Payments | Razorpay (simulated) |
| PDF Generation | jsPDF |
| Celebrations | canvas-confetti |
| Fonts | Google Fonts (Outfit, Inter) |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/zorro7165/Photoframez.git
cd Photoframez

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push database schema (creates SQLite dev.db)
npx prisma db push

# Seed the database with sample frames & admin user
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Admin Credentials
- **Username:** `admin`
- **Password:** `adminpassword123`

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database models
│   ├── seed.ts            # Seed script for sample data
│   └── dev.db             # Local SQLite database (auto-generated)
├── src/
│   ├── app/
│   │   ├── page.tsx               # Gallery homepage
│   │   ├── layout.tsx             # Root layout with CartProvider
│   │   ├── globals.css            # Tailwind + custom animations
│   │   ├── frame/[frameId]/       # Dynamic customizer page
│   │   ├── cart/                   # Shopping cart page
│   │   ├── checkout/               # Checkout with payment simulation
│   │   ├── orders/[orderId]/       # Order tracking & PDF invoice
│   │   ├── orders/track/           # Order lookup portal
│   │   ├── admin/                  # Admin login
│   │   ├── admin/dashboard/        # Full admin dashboard
│   │   └── api/                    # REST API routes
│   ├── components/
│   │   ├── Header.tsx             # Nav with slide-out cart drawer
│   │   ├── Footer.tsx             # Site footer
│   │   ├── FramePreview.tsx       # 2D frame renderer with textures
│   │   ├── FrameCustomizer.tsx    # Configuration control panel
│   │   └── RoomMockup.tsx         # Wall visualization component
│   ├── context/
│   │   └── CartContext.tsx        # Global cart state with localStorage
│   ├── lib/
│   │   ├── prisma.ts             # DB client (auto-selects SQLite/PG)
│   │   ├── constants.ts          # Pricing configs & calculation engine
│   │   └── notifications.ts      # Email & WhatsApp dispatch engine
│   └── generated/                 # Prisma generated client (gitignored)
├── .env.example                   # Environment variable template
├── next.config.ts                 # Next.js config with image domains
├── prisma.config.ts               # Prisma 7 configuration
└── package.json
```

## 🔗 Instagram Integration Flow

1. Post HD artwork on Instagram with Frame ID in caption (e.g., `FRM1023`)
2. Add link in bio/story: `https://yourdomain.com/frame/FRM1023`
3. Customer clicks link → lands on customizer with the exact image pre-loaded
4. Customer configures frame → adds to cart → completes checkout
5. Admin receives order in dashboard → updates status through workflow

## 🌐 Deployment (Vercel)

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel
1. Import your GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Set environment variables:
   - `DATABASE_URL` → Your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET` → A random 32-char secret
   - `NEXT_PUBLIC_APP_URL` → Your Vercel domain URL
3. Deploy!

### 3. Database Setup (Neon PostgreSQL)
1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`
4. Run `npx prisma db push` and `npx tsx prisma/seed.ts`

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/frames` | List all frame designs |
| POST | `/api/frames` | Add new frame (auto Frame ID) |
| GET | `/api/frames/[frameId]` | Get single frame details |
| GET | `/api/orders` | List all orders (admin) |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/[orderId]` | Get order details |
| POST | `/api/admin/auth` | Admin login |
| GET | `/api/admin/auth` | Check admin session |
| PUT | `/api/admin/orders/[orderId]` | Update order status |
| GET | `/api/admin/analytics` | Dashboard analytics |
| GET | `/api/admin/notifications` | Notification logs |

## 📄 License

MIT License - feel free to use this for your business!
