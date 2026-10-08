# 🚀 Production Deployment Guide: Storefront & Admin Portal

This repository is organized into two completely decoupled, production-ready applications:

1. **🛍️ Customer Storefront (`/Shopping`)**:
   - Customer shopping experience, mat customization, cart, Indian checkout, pincode delivery checker, order tracking, and customer account registration/login (`/account/register`).
   - Clean UI with **no admin panel buttons or links** visible to customers.
2. **🛡️ Separate Admin Portal (`/Shopping-Admin` or `/admin-portal`)**:
   - Standalone management dashboard for owner Sumant Kumar.
   - Secure 2FA login, live revenue metrics, inventory editor, order fulfillment with courier tracking, coupon generator, customer directory, and store settings.

---

## 📦 Architecture Overview

```
├── Shopping/ (Storefront & Backend API)
│   ├── src/app/ (Next.js 14 App Router)
│   │   ├── (Storefront pages: shop, cart, checkout, customize, track, account/register)
│   │   └── api/ (REST APIs for products, orders, coupons, settings with CORS)
│   ├── netlify.toml / vercel.json
│   └── admin-portal/ (Embedded copy of standalone admin app)
│
└── Shopping-Admin/ (Independent Standalone Admin Portal Folder on Desktop)
    ├── package.json
    ├── src/app/ (Dashboard, products, orders, customers, coupons, settings, login)
    ├── netlify.toml / vercel.json
    └── README.md
```

---

## 🌐 Deploying to Vercel (100% Free & Recommended)

### Step 1: Deploy Customer Storefront
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.
3. Import your **Shopping** repository.
4. Framework Preset: **Next.js** (leave default).
5. Root Directory: `./`
6. Click **Deploy**.
7. Note down your live storefront URL (e.g. `https://sumantcrafts.vercel.app`).

### Step 2: Deploy Standalone Admin Portal
1. On Vercel, click **"Add New..."** ➔ **"Project"** again.
2. Select the same GitHub repository (or the separate `Shopping-Admin` repo if pushed separately).
3. In **Project Settings**:
   - Click **Edit** next to **Root Directory** and select `admin-portal`.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_STORE_API_URL` = `https://sumantcrafts.vercel.app` (your storefront URL from Step 1).
5. Click **Deploy**.
6. Your admin portal is now live at its own independent domain (e.g. `https://sumantcrafts-admin.vercel.app`)!

---

## ⚡ Deploying to Netlify

### Step 1: Deploy Storefront
1. Go to [netlify.com](https://netlify.com) and click **"Add new site"** ➔ **"Import an existing project"**.
2. Connect your GitHub repository.
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Click **Deploy Site**.

### Step 2: Deploy Admin Portal
1. Click **"Add new site"** ➔ **"Import an existing project"**.
2. Select the repository.
3. Under **Build settings**:
   - Base directory: `admin-portal`
   - Build command: `npm run build`
   - Publish directory: `.next`
4. In **Environment variables**:
   - `NEXT_PUBLIC_STORE_API_URL` = `https://your-store.netlify.app`
5. Click **Deploy Site**.

---

## 💻 Running Locally

### Run Storefront:
```bash
cd Shopping
npm run dev
# Running on http://localhost:3000
```

### Run Separate Admin Portal:
```bash
cd Shopping-Admin
# or cd Shopping/admin-portal
npm run dev
# Running on http://localhost:3001
```

---

## 🔑 Admin Credentials
- **Username:** `admin`
- **Password:** `admin12345`
- **2FA OTP:** Automatically generated on screen for fast 1-click verification.
