# 🪔 Sumant Crafts — Handmade Doormat E-Commerce Platform

A production-ready D2C e-commerce platform built for **Sumant Kumar's** handmade doormat manufacturing business in India. Handcrafted crochet & braided textile doormats sold directly to Indian households with WhatsApp integration, Indian pincode delivery estimation, Razorpay payment support, Cash on Delivery (COD), order tracking, and a full-featured admin management dashboard.

---

## 🌟 Key Features

### 🛒 Storefront & Customer Experience
- **Handcrafted Warm Indian Home Decor Theme:** Earthy terracotta, warm cream, natural jute tones, and clean modern typography.
- **Signature Flower-Shaped Mat Experience:** Verified specifications (Diameter: 20 inches / 50.8 cm, Thickness: 0.6 cm / 6 mm, 100% Handmade, Washable).
- **Interactive Shop Catalog:** Filter by mat shape (Flower, Round, Oval, Rectangular), price range slider, color tones, and stock availability.
- **Product Details Page:** Multi-image gallery with zoom, verified specifications, customer reviews, related items, and mobile sticky CTA bar.
- **Indian Pincode Checker:** Instant delivery date calculation across Indian postal zones and metro hubs.
- **WhatsApp Direct Ordering:** Pre-filled WhatsApp chat messages with order details sent directly to owner Sumant Kumar (+91 98765 43210).
- **Interactive Cart & Drawer:** Quantity adjustments, free shipping progress bar (Free shipping on ₹699+), coupon discount engine (`WELCOME10`, `HOMEDECOR15`, `FESTIVE50`).
- **Clean Indian Address Form:** Name, 10-digit mobile number, Email, Flat/House No, Area, Landmark, City, State, and 6-digit PIN code.
- **All Indian Payment Options:** UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).
- **Order Confirmation & Tracking:** Visual 6-step tracking pipeline (Confirmed ➔ Processing ➔ Packed ➔ Shipped ➔ Out for Delivery ➔ Delivered) with AWB tracking numbers.

---

### 🛡️ Secure Admin Dashboard (`/admin`)
- **Executive Metrics:** Total sales revenue in ₹ INR, active orders, product catalog count, low stock warnings.
- **Order Management:** View orders, change shipment status, assign courier partners (Delhivery, Shiprocket, India Post) and AWB tracking numbers, export orders to CSV.
- **Product Management:** Add new handmade designs, update pricing, MRP, stock levels, shape geometries, dimensions, and color variants.
- **Promo Coupon Engine:** Create, activate, and manage percentage or flat rupee discounts with minimum order thresholds.
- **Reviews Moderation:** View and moderate customer ratings and testimonials.
- **Store Settings:** Toggle Cash on Delivery (COD), configure flat shipping rates, free delivery thresholds, WhatsApp phone numbers, and announcement banners.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) & React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom Indian artisanal color palette
- **Icons:** Lucide React
- **Animations:** Canvas Confetti & CSS Micro-interactions
- **Authentication:** Secure Admin Sessions with `bcryptjs` password hashing and `jose` JWT tokens
- **Database:** Persistent relational JSON/SQLite storage layer with zero native build dependencies (100% portable on any Windows/Mac/Linux environment)
- **Payments:** Razorpay REST API & HMAC-SHA256 signature verification with mock fallback for instant local testing

---

## 🚀 Quick Start & Local Development

### 1. Installation
```bash
# Clone or navigate to the project directory
cd Shopping

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Admin Login Credentials

Access the admin dashboard at: **[http://localhost:3000/admin/login](http://localhost:3000/admin/login)**

- **Username:** `admin` (or `sumant@handmade.in`)
- **Password:** `admin12345`

---

## 💳 Razorpay Payment Gateway Integration

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com).
2. Generate API Keys in **Dashboard ➔ Settings ➔ API Keys**.
3. Update `.env.local`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
   ```
4. In local development without live keys, the store automatically provides a smooth simulation mode so orders can be placed and tested immediately.

---

## 📦 Indian Shipping Integration (Delhivery / Shiprocket / India Post)

The shipping abstraction is located at `src/lib/shipping.ts`:
- **`lookupPincode(pincode)`**: Checks Indian PIN code validity, returns estimated transit days (3 to 5 business days), serviceability, and regional hub.
- **`calculateShippingFee(subtotal)`**: Returns ₹0 (FREE) when subtotal >= ₹699, or flat ₹60 standard fee.
- **Courier Webhook / API Adapter:** The admin panel allows 1-click assignment of AWB tracking numbers for Delhivery, Shiprocket, BlueDart, and India Post.

---

## 📁 Project Directory Structure

```
├── public/
│   └── images/
│       └── hero_doormat.jpg         # High-resolution handcrafted doormat hero photography
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with fonts, JSON-LD Schema & Cart Provider
│   │   ├── page.tsx                 # Home page (Hero, Bestsellers, Shapes, Reviews, FAQ)
│   │   ├── shop/                    # Catalog with filters & sorting
│   │   ├── products/[slug]/         # Product details with zoom & pincode checker
│   │   ├── cart/                    # Cart page with coupon discounts
│   │   ├── checkout/                # Indian address & UPI/Cards/COD checkout
│   │   ├── order-success/           # Confirmation page with tracking CTA & confetti
│   │   ├── track-order/             # 6-step visual order tracking pipeline
│   │   ├── about/                   # Authentic story of Sumant Kumar & artisans
│   │   ├── contact/                 # WhatsApp, email, workshop contact & form
│   │   ├── shipping-policy/         # Delivery guidelines
│   │   ├── refund-policy/           # 7-day replacement policy
│   │   ├── privacy-policy/          # Data security policy
│   │   ├── terms/                   # Terms of service
│   │   ├── cancellation-policy/     # Cancellation rules
│   │   ├── sitemap.ts               # Dynamic SEO sitemap
│   │   ├── robots.ts                # Search crawler rules
│   │   ├── api/                     # REST API routes (Products, Orders, Payments, Admin)
│   │   └── admin/                   # Secure Admin Portal (Dashboard, Orders, Products, Coupons)
│   ├── components/
│   │   ├── Header.tsx               # Sticky navbar with announcement & mobile menu
│   │   ├── Footer.tsx               # Indian payment badges & workshop details
│   │   ├── ProductCard.tsx          # High-conversion handcrafted product card
│   │   ├── CartDrawer.tsx           # Slide-over cart drawer
│   │   ├── WhatsAppButton.tsx       # Floating WhatsApp chat button
│   │   ├── PincodeChecker.tsx       # Indian delivery estimation widget
│   │   ├── ImageGallery.tsx         # Product zoom & gallery
│   │   └── AdminSidebar.tsx         # Admin portal navigation
│   └── lib/
│       ├── types.ts                 # Complete TypeScript definitions
│       ├── db.ts                    # Relational data layer with persistence
│       ├── auth.ts                  # Bcrypt password hashing & JWT token sessions
│       ├── shipping.ts              # Indian postal codes & courier logic
│       ├── razorpay.ts              # Razorpay payment verification
│       ├── utils.ts                 # INR currency formatters & WhatsApp URL builders
│       └── cart-context.tsx         # Cart state provider with LocalStorage sync
├── data/
│   └── store_database.json          # Persistent database file
├── .env.example                     # Environment variables template
├── package.json
└── tailwind.config.ts
```

---

## 🚢 Production Deployment

### Deploying to Vercel
1. Push this repository to GitHub.
2. Import project on [Vercel](https://vercel.com).
3. Set environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`).
4. Deploy in 1-click!

---

## 📜 License
Created for **Sumant Crafts** by Sumant Kumar. All rights reserved.
