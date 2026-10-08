import fs from 'fs';
import path from 'path';
import os from 'os';
import { Product, Order, Coupon, Review, SiteSettings, Customer, AdminUser } from './types';

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  siteSettings: SiteSettings;
  adminUsers: AdminUser[];
  customers: Customer[];
}

const isServerless = Boolean(
  process.env.VERCEL || 
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME || 
  process.env.NOW_REGION
);

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DATA_DIR, 'store_database.json');

const SERVERLESS_DATA_DIR = path.join(os.tmpdir(), 'sumant_shopping_data');
const SERVERLESS_DB_FILE = path.join(SERVERLESS_DATA_DIR, 'store_database.json');

const DATA_DIR = isServerless ? SERVERLESS_DATA_DIR : LOCAL_DATA_DIR;
const DB_FILE = isServerless ? SERVERLESS_DB_FILE : LOCAL_DB_FILE;

let memoryDb: DatabaseSchema | null = null;

// Default initial seed data reflecting Sumant Kumar's handmade doormat business
const INITIAL_DATA: DatabaseSchema = {
  products: [
    {
      id: "prod-starburst-01",
      name: "Handmade Multi-Color Starburst Wheel Doormat",
      slug: "handmade-starburst-wheel-doormat",
      description: "Exquisite 12-point radial starburst doormat, meticulously hand-braided with vibrant multi-tonal cotton textile yarns in pink, emerald green, terracotta, and gold. A stunning centerpiece mat for entryways, living rooms, and pooja areas.",
      price: 499,
      mrp: 899,
      discountPercent: 44,
      shape: "starburst",
      dimensions: "Diameter: 22 inches / 55.8 cm",
      thickness: "0.8 cm / 8 mm",
      material: "100% Pure Braided Cotton & Upcycled Textile Blend",
      washability: "Hand Washable & Gentle Machine Washable",
      craftType: "Handcrafted Radial Starburst Weave",
      colors: ["Vibrant Fiesta Burst", "Pink & Emerald", "Terracotta & Gold"],
      images: [
        "/images/starburst_doormat.png",
        "/images/hero_doormat.jpg"
      ],
      stock: 35,
      sku: "SKM-STR-22-01",
      category: "Starburst Mats",
      rating: 5.0,
      reviewCount: 42,
      isBestSeller: true,
      isNewArrival: true,
      inStock: true,
      tags: ["starburst", "radial", "handmade", "entryway", "bestseller", "multicolor"],
      features: [
        "Diameter: 22 inches / 55.8 cm",
        "Thickness: 0.8 cm / 8 mm",
        "12-point radial starburst petal design",
        "Handcrafted with multi-tonal vibrant yarn",
        "Washable (Hand wash or gentle cycle)",
        "Durable heavy-duty braided construction"
      ],
      createdAt: "2026-10-01T10:00:00.000Z"
    },
    {
      id: "prod-flower-01",
      name: "Handmade Flower-Shaped Braided Doormat",
      slug: "handmade-flower-doormat",
      description: "Our signature handcrafted flower-shaped doormat, meticulously braided by skilled home artisans. Designed with layered floral petals and vibrant, natural color accents. A cheerful, welcoming centerpiece for your entryway, living room, pooja room, or bedside.",
      price: 449,
      mrp: 799,
      discountPercent: 44,
      shape: "flower",
      dimensions: "Diameter: 20 inches / 50.8 cm",
      thickness: "0.6 cm / 6 mm",
      material: "Handmade Braided Cotton & Textile Blend",
      washability: "Hand Washable & Gentle Machine Washable",
      craftType: "Handcrafted Braided & Stitched Textile",
      colors: ["Marigold & Terracotta", "Multicolor Bloom", "Ivory & Forest Green", "Sunset Ochre"],
      images: [
        "/images/hero_doormat.jpg",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80"
      ],
      stock: 45,
      sku: "SKM-FLW-20-01",
      category: "Floral Mats",
      rating: 4.9,
      reviewCount: 38,
      isBestSeller: true,
      isNewArrival: false,
      inStock: true,
      tags: ["flower", "handmade", "entryway", "crochet", "bestseller", "washable"],
      features: [
        "Diameter: 20 inches / 50.8 cm",
        "Thickness: 0.6 cm / 6 mm",
        "Handmade by skilled artisans",
        "Washable (Hand wash or gentle cycle)",
        "Durable braided textile construction",
        "Vibrant multi-color flower pattern"
      ],
      createdAt: "2026-09-01T10:00:00.000Z"
    },
    {
      id: "prod-round-02",
      name: "Spiral Round Braided Cotton Doormat",
      slug: "spiral-round-braided-doormat",
      description: "A timeless circular braided doormat crafted with concentric spiral rings. Provides a neat, rustic look to doorways, balconies, and bedrooms.",
      price: 399,
      mrp: 699,
      discountPercent: 43,
      shape: "round",
      dimensions: "Diameter: 22 inches / 56 cm",
      thickness: "0.6 cm / 6 mm",
      material: "100% Braided Cotton Yarn",
      washability: "Washable (Cold Water Hand Wash)",
      craftType: "Handmade Spiral Braiding",
      colors: ["Earthy Terracotta & Jute", "Indigo Sky & Cream", "Coffee Brown"],
      images: [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80"
      ],
      stock: 30,
      sku: "SKM-RND-22-02",
      category: "Round Mats",
      rating: 4.8,
      reviewCount: 24,
      isBestSeller: true,
      isNewArrival: false,
      inStock: true,
      tags: ["round", "braided", "cotton", "living room"],
      features: [
        "Diameter: 22 inches / 56 cm",
        "Thickness: 0.6 cm / 6 mm",
        "Handmade with strong braided cotton",
        "Washable fabric",
        "Double-sided usable design"
      ],
      createdAt: "2026-09-10T10:00:00.000Z"
    },
    {
      id: "prod-oval-03",
      name: "Handmade Oval Braided Entryway Mat",
      slug: "handmade-oval-braided-mat",
      description: "Spacious oval profile tailored for wider main doors, passage hallways, and kitchen counters. Hand-braided with contrasting border tones.",
      price: 499,
      mrp: 899,
      discountPercent: 44,
      shape: "oval",
      dimensions: "24 x 16 inches / 60.9 x 40.6 cm",
      thickness: "0.6 cm / 6 mm",
      material: "Handmade Cotton & Jute Blend",
      washability: "Hand Washable",
      craftType: "Hand-braided Oval Stitching",
      colors: ["Sunset Terracotta", "Olive Green & Cream", "Natural Jute & Mustard"],
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
      ],
      stock: 22,
      sku: "SKM-OVL-24-03",
      category: "Oval Mats",
      rating: 4.7,
      reviewCount: 19,
      isBestSeller: false,
      isNewArrival: true,
      inStock: true,
      tags: ["oval", "entryway", "handmade", "hallway"],
      features: [
        "Dimensions: 24 x 16 inches",
        "Thickness: 0.6 cm / 6 mm",
        "Handmade braided finish",
        "Easy hand wash care",
        "Comfortable foot feel"
      ],
      createdAt: "2026-09-20T10:00:00.000Z"
    },
    {
      id: "prod-rect-04",
      name: "Classic Rectangular Woven Doorstep Mat",
      slug: "classic-rectangular-woven-doormat",
      description: "Traditional rectangular geometry with dense hand-woven textured ribs. Ideal for main doors, apartment entrances, and office cabins.",
      price: 349,
      mrp: 599,
      discountPercent: 42,
      shape: "rectangle",
      dimensions: "24 x 16 inches / 60 x 40 cm",
      thickness: "0.7 cm / 7 mm",
      material: "Textured Cotton Textile",
      washability: "Hand Wash & Machine Washable",
      craftType: "Handloom Woven Weft",
      colors: ["Charcoal Grey", "Brick Red & Beige", "Classic Navy"],
      images: [
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80"
      ],
      stock: 50,
      sku: "SKM-RCT-24-04",
      category: "Rectangular Mats",
      rating: 4.8,
      reviewCount: 31,
      isBestSeller: true,
      isNewArrival: false,
      inStock: true,
      tags: ["rectangle", "doorstep", "classic", "woven"],
      features: [
        "Dimensions: 24 x 16 inches",
        "Thickness: 0.7 cm / 7 mm",
        "Hand-woven construction",
        "Machine and hand washable",
        "Fits standard Indian doorway widths"
      ],
      createdAt: "2026-09-05T10:00:00.000Z"
    },
    {
      id: "prod-lotus-05",
      name: "Handcrafted Lotus Bloom Accent Mat",
      slug: "handcrafted-lotus-bloom-accent-mat",
      description: "Artistic lotus petal silhouette crafted with delicate braided cotton cords. Adds an auspicious and elegant traditional touch to home entrances and mandir spaces.",
      price: 479,
      mrp: 849,
      discountPercent: 44,
      shape: "flower",
      dimensions: "Diameter: 20 inches / 50.8 cm",
      thickness: "0.6 cm / 6 mm",
      material: "Hand-braided Cotton Thread",
      washability: "Hand Washable with Mild Detergent",
      craftType: "Handcrafted Petal Stitching",
      colors: ["Lotus Pink & Cream", "Haldi Yellow & Green", "Pure Crimson"],
      images: [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
      ],
      stock: 18,
      sku: "SKM-LTS-20-05",
      category: "Floral Mats",
      rating: 4.9,
      reviewCount: 15,
      isBestSeller: false,
      isNewArrival: true,
      inStock: true,
      tags: ["lotus", "flower", "pooja room", "festive"],
      features: [
        "Diameter: 20 inches / 50.8 cm",
        "Thickness: 0.6 cm / 6 mm",
        "Handmade lotus petal shape",
        "Washable fabric",
        "Ideal for festival decor and daily entrance use"
      ],
      createdAt: "2026-09-25T10:00:00.000Z"
    },
    {
      id: "prod-mandala-06",
      name: "Boho Sunburst Multi-Color Doormat",
      slug: "boho-sunburst-multicolor-doormat",
      description: "Sunburst circular pattern using upcycled soft cotton yarns. Each piece is unique and radiates warm artistic energy at your door.",
      price: 429,
      mrp: 749,
      discountPercent: 43,
      shape: "round",
      dimensions: "Diameter: 21 inches / 53.3 cm",
      thickness: "0.6 cm / 6 mm",
      material: "Braided Cotton Yarn",
      washability: "Hand Washable",
      craftType: "Handmade Sunburst Weave",
      colors: ["Sunburst Multi", "Earthy Mustard", "Peacock Teal"],
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80"
      ],
      stock: 25,
      sku: "SKM-SUN-21-06",
      category: "Round Mats",
      rating: 4.8,
      reviewCount: 12,
      isBestSeller: false,
      isNewArrival: true,
      inStock: true,
      tags: ["sunburst", "round", "boho", "handmade"],
      features: [
        "Diameter: 21 inches / 53.3 cm",
        "Thickness: 0.6 cm / 6 mm",
        "Handmade braided yarn",
        "Easy hand wash care",
        "Rich handcrafted texture"
      ],
      createdAt: "2026-09-28T10:00:00.000Z"
    }
  ],
  orders: [
    {
      id: "ord-1001",
      orderNumber: "SKM-2026-1082",
      customer: {
        name: "Priya Sharma",
        phone: "9876543210",
        email: "priya.sharma@example.com",
        address: {
          houseNo: "Flat 402, Sunshine Heights",
          street: "14th Main, Indiranagar",
          landmark: "Near Metro Pillar 84",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560038"
        }
      },
      items: [
        {
          productId: "prod-flower-01",
          name: "Handmade Flower-Shaped Braided Doormat",
          slug: "handmade-flower-doormat",
          price: 449,
          mrp: 799,
          quantity: 2,
          selectedColor: "Marigold & Terracotta",
          image: "/images/hero_doormat.jpg",
          dimensions: "Diameter: 20 inches / 50.8 cm",
          shape: "flower"
        }
      ],
      subtotal: 898,
      shippingFee: 0,
      discount: 89,
      couponCode: "WELCOME10",
      totalAmount: 809,
      paymentMethod: "UPI",
      paymentStatus: "PAID",
      razorpayOrderId: "order_demo_1001",
      razorpayPaymentId: "pay_demo_1001_upi",
      orderStatus: "SHIPPED",
      trackingNumber: "DLV-9823471029",
      courierPartner: "Delhivery Express",
      estimatedDeliveryDate: "10 Oct 2026",
      createdAt: "2026-10-04T11:20:00.000Z",
      updatedAt: "2026-10-05T14:30:00.000Z"
    },
    {
      id: "ord-1002",
      orderNumber: "SKM-2026-1083",
      customer: {
        name: "Rajesh Verma",
        phone: "9811223344",
        email: "rajesh.v@example.com",
        address: {
          houseNo: "House 24, Block C",
          street: "Green Park Extension",
          landmark: "Opposite Gurudwara",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110016"
        }
      },
      items: [
        {
          productId: "prod-round-02",
          name: "Spiral Round Braided Cotton Doormat",
          slug: "spiral-round-braided-doormat",
          price: 399,
          mrp: 699,
          quantity: 1,
          selectedColor: "Earthy Terracotta & Jute",
          image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
          dimensions: "Diameter: 22 inches / 56 cm",
          shape: "round"
        }
      ],
      subtotal: 399,
      shippingFee: 60,
      discount: 0,
      totalAmount: 459,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PROCESSING",
      estimatedDeliveryDate: "11 Oct 2026",
      createdAt: "2026-10-05T09:15:00.000Z",
      updatedAt: "2026-10-05T09:15:00.000Z"
    }
  ],
  coupons: [
    {
      id: "cpn-1",
      code: "WELCOME10",
      discountPercent: 10,
      minOrderValue: 399,
      isActive: true,
      description: "Get 10% OFF on your first handcrafted mat order"
    },
    {
      id: "cpn-2",
      code: "HOMEDECOR15",
      discountPercent: 15,
      minOrderValue: 799,
      maxDiscount: 200,
      isActive: true,
      description: "Get 15% OFF on orders above ₹799"
    },
    {
      id: "cpn-3",
      code: "FESTIVE50",
      discountAmount: 50,
      minOrderValue: 499,
      isActive: true,
      description: "Flat ₹50 OFF on orders above ₹499"
    }
  ],
  reviews: [
    {
      id: "rev-1",
      productId: "prod-flower-01",
      productName: "Handmade Flower-Shaped Braided Doormat",
      customerName: "Ananya Iyer",
      city: "Mumbai, Maharashtra",
      rating: 5,
      comment: "The flower shape looks so charming at our main door! Exact 20 inches size as described, neat stitching, and washed it easily by hand without colors bleeding. Supporting handmade Indian artisans feels great.",
      verified: true,
      createdAt: "2026-09-18T14:20:00.000Z",
      isApproved: true
    },
    {
      id: "rev-2",
      productId: "prod-flower-01",
      productName: "Handmade Flower-Shaped Braided Doormat",
      customerName: "Vikram Sen",
      city: "Kolkata, West Bengal",
      rating: 5,
      comment: "Superb quality direct from maker Sumant Kumar. Reached in 4 days via Delhivery. Looks much more expensive than ₹449. Highly recommended!",
      verified: true,
      createdAt: "2026-09-22T16:45:00.000Z",
      isApproved: true
    },
    {
      id: "rev-3",
      productId: "prod-round-02",
      productName: "Spiral Round Braided Cotton Doormat",
      customerName: "Meera Nair",
      city: "Kochi, Kerala",
      rating: 5,
      comment: "Beautiful braided work, thick and feels comfortable underfoot. Looks great on our balcony entryway.",
      verified: true,
      createdAt: "2026-09-25T11:10:00.000Z",
      isApproved: true
    }
  ],
  siteSettings: {
    storeName: "Home-Warrior",
    ownerName: "Sumant Kumar",
    tagline: "Beautiful Handmade Doormats for Every Home",
    whatsappNumber: "+91 8878112007",
    supportPhone: "+91 8878112007",
    supportEmail: "mandaldevanand@gmail.com",
    workshopAddress: "Home Warrior Handmade Doormats, Khursipar, Bhilai, Durg, Chhattisgarh - 490011, India",
    enableCOD: true,
    codFee: 40,
    freeShippingThreshold: 699,
    flatShippingRate: 60,
    announcementText: "✨ Direct From Artisan • Free Express Shipping on orders above ₹699 • 100% Handmade",
    bannerHeading: "Beautiful Handmade Doormats for Every Home",
    bannerSubheading: "Handcrafted with care. Designed for comfort, style and everyday use.",
    amazonStoreUrl: "https://amazon.in",
    flipkartStoreUrl: "https://flipkart.com",
    instagramUrl: "https://instagram.com",
    returnWindowDays: 7,
    upiId: "8878112007@upi",
    upiMerchantName: "Home-Warrior",
    enableUpiPayment: true
  },
  adminUsers: [
    {
      id: "admin-1",
      name: "Sumant Kumar (Super Admin)",
      username: "admin",
      email: "mandaldevanand@gmail.com",
      phone: "+91 8878112007",
      role: "superadmin",
      // bcrypt hash for "admin12345"
      passwordHash: "$2a$10$7Z2t5K2sP6aK7vFm7vPZ9.uWjXl8Yn2hVwO1wFv3Qo9K.qGvJ7Z2u",
      isActive: true,
      mobileVerified: true,
      emailVerified: true,
      createdAt: "2026-10-01T10:00:00.000Z"
    },
    {
      id: "admin-2",
      name: "Devanand Mandal (Store Manager)",
      username: "manager",
      email: "operations@sumantcrafts.in",
      phone: "+91 9876543210",
      role: "manager",
      // bcrypt hash for "manager12345"
      passwordHash: "$2a$10$xd8LgaBZgVrHGQOo1b9tJukGipjC4rJ3MyeRwET4z/4iRErF8D/NC",
      isActive: true,
      mobileVerified: true,
      emailVerified: true,
      createdAt: "2026-10-02T10:00:00.000Z"
    },
    {
      id: "admin-3",
      name: "Crafts Support & Inventory Lead",
      username: "support",
      email: "support@sumantcrafts.in",
      phone: "+91 9826012345",
      role: "support",
      // bcrypt hash for "support12345"
      passwordHash: "$2a$10$VENZtM45ryroki8HzM8Mb.gg0D69ckjQq4oYyaJHlxWSfN3uaGrJO",
      isActive: true,
      mobileVerified: true,
      emailVerified: true,
      createdAt: "2026-10-03T10:00:00.000Z"
    }
  ],
  customers: []
};

function normalizeAdminUsers(admins?: any[]): AdminUser[] {
  if (!admins || admins.length === 0) {
    return [...INITIAL_DATA.adminUsers];
  }
  const merged = [...admins];
  for (const initAdmin of INITIAL_DATA.adminUsers) {
    const existingIdx = merged.findIndex(
      (a: any) =>
        a.username?.toLowerCase() === initAdmin.username.toLowerCase() ||
        a.email?.toLowerCase() === initAdmin.email.toLowerCase()
    );
    if (existingIdx === -1) {
      merged.push({ ...initAdmin });
    } else {
      merged[existingIdx] = {
        ...initAdmin,
        ...merged[existingIdx],
        id: merged[existingIdx].id || initAdmin.id,
        name: merged[existingIdx].name || initAdmin.name,
        role: merged[existingIdx].role || initAdmin.role,
        phone: merged[existingIdx].phone || initAdmin.phone,
        isActive: merged[existingIdx].isActive !== undefined ? merged[existingIdx].isActive : true,
        mobileVerified: merged[existingIdx].mobileVerified !== undefined ? merged[existingIdx].mobileVerified : true,
        emailVerified: merged[existingIdx].emailVerified !== undefined ? merged[existingIdx].emailVerified : true,
      };
    }
  }
  return merged;
}

function ensureDbExists(): DatabaseSchema {
  if (memoryDb) {
    if (!memoryDb.adminUsers || memoryDb.adminUsers.length < 3) {
      memoryDb.adminUsers = normalizeAdminUsers(memoryDb.adminUsers);
    }
    return memoryDb;
  }

  // 1. Try reading existing DB file if it exists
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw);
      if (memoryDb) {
        memoryDb.adminUsers = normalizeAdminUsers(memoryDb.adminUsers);
        return memoryDb;
      }
    }
  } catch (err) {
    console.warn('Could not read DB_FILE, attempting seed:', err);
  }

  // 2. Load seed data (prefer bundled local DB file if available, otherwise INITIAL_DATA)
  let seedData: DatabaseSchema = INITIAL_DATA;
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      seedData = JSON.parse(raw);
    }
  } catch (err) {
    seedData = INITIAL_DATA;
  }

  seedData.adminUsers = normalizeAdminUsers(seedData.adminUsers);

  // 3. Try writing seed to writable DB location
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write not permitted, utilizing in-memory cache:', err);
  }

  memoryDb = seedData;
  return memoryDb;
}

function saveDb(data: DatabaseSchema) {
  memoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to disk in serverless environment, data preserved in memory:', err);
  }
}

export const db = {
  // Products
  getProducts(): Product[] {
    const data = ensureDbExists();
    return data.products;
  },

  getProductBySlug(slug: string): Product | undefined {
    const data = ensureDbExists();
    return data.products.find(p => p.slug === slug || p.id === slug);
  },

  getProductById(id: string): Product | undefined {
    const data = ensureDbExists();
    return data.products.find(p => p.id === id);
  },

  createProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const data = ensureDbExists();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.products.unshift(newProduct);
    saveDb(data);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const data = ensureDbExists();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    data.products[index] = { ...data.products[index], ...updates };
    saveDb(data);
    return data.products[index];
  },

  deleteProduct(id: string): boolean {
    const data = ensureDbExists();
    const lenBefore = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length !== lenBefore) {
      saveDb(data);
      return true;
    }
    return false;
  },

  // Orders
  getOrders(): Order[] {
    const data = ensureDbExists();
    return data.orders;
  },

  getOrderById(id: string): Order | undefined {
    const data = ensureDbExists();
    return data.orders.find(o => o.id === id || o.orderNumber === id);
  },

  lookupOrder(orderNumber: string, phone: string): Order | undefined {
    const data = ensureDbExists();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return data.orders.find(o => {
      const matchNum = o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase() || o.id === orderNumber.trim();
      const oPhone = o.customer.phone.replace(/[^0-9]/g, '');
      const matchPhone = oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone);
      return matchNum && (cleanPhone.length >= 4 ? matchPhone : true);
    });
  },

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const data = ensureDbExists();
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    data.orders.unshift(newOrder);
    saveDb(data);
    return newOrder;
  },

  updateOrderStatus(
    id: string,
    status: Order['orderStatus'],
    trackingNumber?: string,
    courierPartner?: string,
    paymentStatus?: Order['paymentStatus']
  ): Order | null {
    const data = ensureDbExists();
    const index = data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (index === -1) return null;
    
    data.orders[index].orderStatus = status;
    data.orders[index].updatedAt = new Date().toISOString();
    if (trackingNumber) data.orders[index].trackingNumber = trackingNumber;
    if (courierPartner) data.orders[index].courierPartner = courierPartner;
    if (paymentStatus) data.orders[index].paymentStatus = paymentStatus;
    
    saveDb(data);
    return data.orders[index];
  },

  // Coupons
  getCoupons(): Coupon[] {
    const data = ensureDbExists();
    return data.coupons;
  },

  getCouponByCode(code: string): Coupon | undefined {
    const data = ensureDbExists();
    return data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  },

  createCoupon(coupon: Omit<Coupon, 'id'>): Coupon {
    const data = ensureDbExists();
    const newCoupon: Coupon = {
      ...coupon,
      id: `cpn-${Date.now()}`,
      code: coupon.code.toUpperCase().trim(),
    };
    data.coupons.push(newCoupon);
    saveDb(data);
    return newCoupon;
  },

  toggleCoupon(id: string): Coupon | null {
    const data = ensureDbExists();
    const item = data.coupons.find(c => c.id === id);
    if (!item) return null;
    item.isActive = !item.isActive;
    saveDb(data);
    return item;
  },

  deleteCoupon(id: string): boolean {
    const data = ensureDbExists();
    const lenBefore = data.coupons.length;
    data.coupons = data.coupons.filter(c => c.id !== id);
    if (data.coupons.length !== lenBefore) {
      saveDb(data);
      return true;
    }
    return false;
  },

  // Reviews
  getReviews(productId?: string): Review[] {
    const data = ensureDbExists();
    if (productId) {
      return data.reviews.filter(r => r.productId === productId && r.isApproved);
    }
    return data.reviews;
  },

  addReview(review: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Review {
    const data = ensureDbExists();
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isApproved: true, // auto-approved for instant satisfaction
    };
    data.reviews.unshift(newReview);
    saveDb(data);
    return newReview;
  },

  // Site Settings
  getSettings(): SiteSettings {
    const data = ensureDbExists();
    let changed = false;
    if (!data.siteSettings.upiId) {
      data.siteSettings.upiId = "8878112007@upi";
      changed = true;
    }
    if (!data.siteSettings.upiMerchantName) {
      data.siteSettings.upiMerchantName = "Home-Warrior";
      changed = true;
    }
    if (data.siteSettings.enableUpiPayment === undefined) {
      data.siteSettings.enableUpiPayment = true;
      changed = true;
    }
    if (changed) {
      saveDb(data);
    }
    return data.siteSettings;
  },

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    const data = ensureDbExists();
    data.siteSettings = { ...data.siteSettings, ...updates };
    saveDb(data);
    return data.siteSettings;
  },

  // Admin user operations
  getAdminUsers(): AdminUser[] {
    const data = ensureDbExists();
    if (!data.adminUsers || data.adminUsers.length === 0) {
      data.adminUsers = [...INITIAL_DATA.adminUsers];
      saveDb(data);
    }
    return data.adminUsers;
  },

  getAdminUser(query: string): AdminUser | undefined {
    const data = ensureDbExists();
    if (!data.adminUsers || data.adminUsers.length === 0) {
      data.adminUsers = [...INITIAL_DATA.adminUsers];
      saveDb(data);
    }
    const q = query.toLowerCase().trim();
    return data.adminUsers.find(
      u =>
        u.id.toLowerCase() === q ||
        u.username.toLowerCase() === q ||
        u.email.toLowerCase() === q ||
        (u.phone && u.phone.replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, ''))
    );
  },

  createAdminUser(admin: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
    const data = ensureDbExists();
    const newAdmin: AdminUser = {
      ...admin,
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isActive: admin.isActive !== undefined ? admin.isActive : true,
      mobileVerified: admin.mobileVerified !== undefined ? admin.mobileVerified : true,
      emailVerified: admin.emailVerified !== undefined ? admin.emailVerified : true,
    };
    data.adminUsers.push(newAdmin);
    saveDb(data);
    return newAdmin;
  },

  updateAdminUser(idOrUsername: string, updates: Partial<AdminUser>): AdminUser | null {
    const data = ensureDbExists();
    const q = idOrUsername.toLowerCase().trim();
    const index = data.adminUsers.findIndex(
      u => u.id.toLowerCase() === q || u.username.toLowerCase() === q || u.email.toLowerCase() === q
    );
    if (index === -1) return null;

    data.adminUsers[index] = {
      ...data.adminUsers[index],
      ...updates,
    };
    saveDb(data);
    return data.adminUsers[index];
  },

  deleteAdminUser(idOrUsername: string): boolean {
    const data = ensureDbExists();
    const q = idOrUsername.toLowerCase().trim();
    // Safety guard: Must retain at least one superadmin
    const superadmins = data.adminUsers.filter(a => a.role === 'superadmin');
    const target = data.adminUsers.find(
      u => u.id.toLowerCase() === q || u.username.toLowerCase() === q
    );
    if (!target) return false;
    if (target.role === 'superadmin' && superadmins.length <= 1) {
      throw new Error('Cannot delete the last remaining Super Admin account.');
    }

    data.adminUsers = data.adminUsers.filter(u => u.id !== target.id);
    saveDb(data);
    return true;
  },

  updateAdminCredentials(newUsername: string, newPasswordHash: string, newEmail?: string) {
    const data = ensureDbExists();
    if (!data.adminUsers || data.adminUsers.length === 0) {
      data.adminUsers = [...INITIAL_DATA.adminUsers];
    }
    data.adminUsers[0] = {
      ...data.adminUsers[0],
      username: newUsername,
      email: newEmail || data.adminUsers[0]?.email || 'mandaldevanand@gmail.com',
      passwordHash: newPasswordHash,
    };
    saveDb(data);
    return data.adminUsers[0];
  },

  // ─── Customer Functions ─────────────────────────────────────────────────────

  getCustomerByEmail(email: string): Customer | undefined {
    const data = ensureDbExists();
    if (!data.customers) data.customers = [];
    return data.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  },

  getCustomerByPhone(phone: string): Customer | undefined {
    const data = ensureDbExists();
    if (!data.customers) data.customers = [];
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const last10 = cleanDigits.slice(-10);
    if (!last10) return undefined;
    return data.customers.find(c => {
      if (!c.phone) return false;
      const cClean = c.phone.replace(/[^0-9]/g, '').slice(-10);
      return cClean === last10;
    });
  },

  getCustomerById(id: string): Customer | undefined {
    const data = ensureDbExists();
    if (!data.customers) data.customers = [];
    return data.customers.find(c => c.id === id);
  },

  createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const data = ensureDbExists();
    if (!data.customers) data.customers = [];
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.customers.push(newCustomer);
    saveDb(data);
    return newCustomer;
  },

  updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Customer | null {
    const data = ensureDbExists();
    if (!data.customers) data.customers = [];
    const idx = data.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    data.customers[idx] = {
      ...data.customers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDb(data);
    return data.customers[idx];
  },

  getAllCustomers(): Customer[] {
    const data = ensureDbExists();
    if (!data.customers) data.customers = [];
    return data.customers;
  },

  getCustomerOrders(customerId: string): Order[] {
    const data = ensureDbExists();
    const customer = data.customers?.find(c => c.id === customerId);
    if (!customer) return [];
    return data.orders.filter(
      o => o.customer.email.toLowerCase() === customer.email.toLowerCase()
    );
  },
};
