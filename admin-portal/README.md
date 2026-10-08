# 🛡️ Sumant Crafts — Standalone Admin Control Center

This is the independent, production-ready Admin Dashboard web application for **Sumant Crafts** handmade doormats. It operates completely separately from the customer-facing storefront site and can be deployed to its own domain or subdomain (e.g. `admin.sumantcrafts.com` or `sumantcrafts-admin.vercel.app`).

---

## 🌟 Key Features

1. **🔐 Secure 2FA Authentication:**
   - Default Username: `admin`
   - Default Password: `admin12345`
   - Automated 2FA Security OTP verification prompt.
2. **📊 Executive Dashboard:**
   - Total sales revenue in ₹ INR.
   - Pending orders counter requiring packing & courier dispatch.
   - Active catalog item counter.
   - Low stock warning banners (≤ 20 pieces).
3. **📦 Product Catalog Manager (`/products`):**
   - Filter by shape (Flower, Starburst, Round, Oval, Rectangle).
   - Instant search by mat name or SKU.
   - Add new handmade mat designs with image URLs, shapes, dimensions, and prices.
   - Edit or delete items and toggle inventory stock levels.
4. **🛒 Customer Orders Manager (`/orders`):**
   - Live status workflow (`CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
   - One-click courier assignment: **Delhivery**, **India Post**, **Shiprocket**, **Blue Dart**.
   - Input AWB Tracking ID to generate customer tracking links.
   - 1-click **Export to CSV**.
5. **👥 Customer Directory (`/customers`):**
   - Lifetime order counts and total rupees spent.
   - Quick phone and email contact info.
6. **🎟️ Coupons & Promotions (`/coupons`):**
   - Create percentage (%) or flat (₹) discount codes.
   - Set minimum cart value requirements and expiration dates.
7. **⚙️ Store & API Settings (`/settings`):**
   - Configure live storefront backend API URL (`NEXT_PUBLIC_STORE_API_URL`).
   - Workshop contact details and Cash on Delivery (COD) switches.

---

## 🚀 How to Run Locally

```bash
# Navigate to admin-portal directory
cd admin-portal

# Install dependencies (if not already installed)
npm install

# Start the admin portal on port 3001
npm run dev
```

Visit: **http://localhost:3001**

---

## 🌐 1-Click Deployment Guide

### Option 1: Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. In **Project Settings**:
   - Set **Root Directory** to `admin-portal`
   - Framework Preset: **Next.js**
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_STORE_API_URL`: Your deployed customer storefront URL (e.g. `https://sumantcrafts.vercel.app`)
6. Click **Deploy**!

### Option 2: Netlify
1. Log in to [netlify.com](https://netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Select your GitHub repository.
3. In **Build Settings**:
   - Base directory: `admin-portal`
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Set Environment Variable:
   - `NEXT_PUBLIC_STORE_API_URL`: `https://your-store.netlify.app`
5. Click **Deploy Site**!
