import { Product, Order, Customer, Coupon, Review, SiteSettings } from './types';

const STORE_API_BASE = process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:3000';

// Initial fallback mock data for testing & standalone deployment
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-starburst-01',
    name: 'Handmade Multi-Color Starburst Wheel Doormat',
    slug: 'handmade-starburst-wheel-doormat',
    description: 'Exquisite 12-point radial starburst doormat, meticulously hand-braided with vibrant multi-tonal cotton textile yarns.',
    price: 499,
    mrp: 899,
    discountPercent: 44,
    shape: 'starburst',
    dimensions: 'Diameter: 22 inches / 55.8 cm',
    thickness: '0.8 cm / 8 mm',
    material: '100% Pure Braided Cotton & Upcycled Blend',
    washability: 'Hand Washable & Gentle Machine Washable',
    craftType: 'Handcrafted Radial Starburst Weave',
    colors: ['Vibrant Fiesta Burst', 'Pink & Emerald', 'Terracotta & Gold'],
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
    stock: 35,
    sku: 'SKM-STR-22-01',
    category: 'Starburst Mats',
    rating: 5.0,
    reviewCount: 42,
    isBestSeller: true,
    isNewArrival: true,
    inStock: true,
    tags: ['starburst', 'handmade', 'entryway', 'bestseller'],
    features: ['Diameter: 22 inches', 'Washable', 'Durable heavy-duty braided'],
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'prod-flower-01',
    name: 'Handmade Flower-Shaped Braided Doormat',
    slug: 'handmade-flower-doormat',
    description: 'Our signature handcrafted flower-shaped doormat, meticulously braided by skilled home artisans.',
    price: 449,
    mrp: 799,
    discountPercent: 44,
    shape: 'flower',
    dimensions: 'Diameter: 20 inches / 50.8 cm',
    thickness: '0.6 cm / 6 mm',
    material: 'Handmade Braided Cotton & Textile Blend',
    washability: 'Hand Washable & Gentle Machine Washable',
    craftType: 'Handcrafted Braided & Stitched Textile',
    colors: ['Marigold & Terracotta', 'Multicolor Bloom', 'Ivory & Forest Green'],
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80'],
    stock: 45,
    sku: 'SKM-FLW-20-01',
    category: 'Floral Mats',
    rating: 4.9,
    reviewCount: 38,
    isBestSeller: true,
    isNewArrival: false,
    inStock: true,
    tags: ['flower', 'handmade', 'entryway'],
    features: ['Diameter: 20 inches', 'Thickness: 0.6 cm', 'Handmade by skilled artisans'],
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'prod-round-02',
    name: 'Spiral Round Braided Cotton Doormat',
    slug: 'spiral-round-braided-doormat',
    description: 'Natural aesthetic circular doormat with concentric color bands in earth tones.',
    price: 399,
    mrp: 699,
    discountPercent: 43,
    shape: 'round',
    dimensions: 'Diameter: 20 inches / 50.8 cm',
    thickness: '0.7 cm / 7 mm',
    material: 'Pure Hand-Spun Braided Cotton Yarn',
    washability: 'Machine Washable (Gentle cycle)',
    craftType: 'Spiral Braided Coil Stitch',
    colors: ['Natural Jute & Terracotta', 'Indigo & Cream'],
    images: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80'],
    stock: 28,
    sku: 'SKM-RND-20-02',
    category: 'Round Mats',
    rating: 4.8,
    reviewCount: 29,
    isBestSeller: true,
    isNewArrival: false,
    inStock: true,
    tags: ['round', 'spiral', 'cotton'],
    features: ['Diameter: 20 inches', 'Reversible use', 'Anti-skid floor grip'],
    createdAt: '2026-09-10T10:00:00.000Z',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'SKM-2026-9951',
    orderNumber: 'SKM-2026-9951',
    items: [
      {
        productId: 'prod-starburst-01',
        name: 'Handmade Multi-Color Starburst Wheel Doormat',
        price: 499,
        quantity: 2,
        selectedColor: 'Vibrant Fiesta Burst',
        shape: 'starburst',
        dimensions: 'Diameter: 22 inches',
      },
    ],
    customer: {
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      email: 'rahul.sharma@gmail.com',
      addressLine1: 'Flat 402, Shanti Vihar Apartments',
      landmark: 'Near Hanuman Temple',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221005',
    },
    subtotal: 998,
    discount: 100,
    couponCode: 'WELCOME10',
    shippingFee: 0,
    totalAmount: 898,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    orderStatus: 'CONFIRMED',
    trackingNumber: 'DLH-IND-99182344',
    courierPartner: 'Delhivery',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'SKM-2026-8842',
    orderNumber: 'SKM-2026-8842',
    items: [
      {
        productId: 'prod-flower-01',
        name: 'Handmade Flower-Shaped Braided Doormat',
        price: 449,
        quantity: 1,
        selectedColor: 'Marigold & Terracotta',
        shape: 'flower',
        dimensions: 'Diameter: 20 inches',
      },
    ],
    customer: {
      fullName: 'Pooja Verma',
      phone: '9123456789',
      email: 'pooja.verma@outlook.com',
      addressLine1: 'House No 12, Krishna Colony',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
    },
    subtotal: 449,
    discount: 0,
    shippingFee: 49,
    totalAmount: 498,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '9876543210',
    totalOrders: 3,
    totalSpent: 2490,
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-10-08T01:00:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'Pooja Verma',
    email: 'pooja.verma@outlook.com',
    phone: '9123456789',
    totalOrders: 1,
    totalSpent: 498,
    createdAt: '2026-10-07T12:00:00.000Z',
    updatedAt: '2026-10-07T12:00:00.000Z',
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discountPercent: 10,
    minOrderAmount: 499,
    maxDiscount: 150,
    expiresAt: '2026-12-31',
    isActive: true,
    description: '10% off on your first order above ₹499',
  },
  {
    code: 'HOMEDECOR15',
    discountPercent: 15,
    minOrderAmount: 799,
    maxDiscount: 200,
    expiresAt: '2026-11-30',
    isActive: true,
    description: '15% festive discount for home decor enthusiasts',
  },
  {
    code: 'FESTIVE50',
    discountFlat: 50,
    minOrderAmount: 599,
    expiresAt: '2026-12-31',
    isActive: true,
    description: 'Flat ₹50 off on orders over ₹599',
  },
];

const INITIAL_SETTINGS: SiteSettings = {
  storeName: 'Home-Warrior',
  phone: '+91 8878112007',
  email: 'mandaldevanand@gmail.com',
  whatsappNumber: '+91 8878112007',
  address: 'Home Warrior Handmade Doormats, Khursipar, Bhilai, Durg, Chhattisgarh - 490011, India',
  freeShippingThreshold: 699,
  defaultShippingFee: 49,
  codEnabled: true,
  announcementText: 'Direct from Maker (Sumant Kumar) • 100% Handmade in India • Free Shipping on ₹699+',
};

// Helper for local browser storage
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`admin_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`admin_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const adminApi = {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${STORE_API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setLocal('products', data.products);
          return data.products;
        }
      }
    } catch {
      // Offline fallback
    }
    return getLocal('products', INITIAL_PRODUCTS);
  },

  async saveProduct(product: Product): Promise<boolean> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    setLocal('products', products);

    // Try sync to store
    try {
      await fetch(`${STORE_API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch {}
    return true;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    setLocal('products', filtered);
    try {
      await fetch(`${STORE_API_BASE}/api/products/${id}`, { method: 'DELETE' });
    } catch {}
    return true;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${STORE_API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setLocal('orders', data.orders);
          return data.orders;
        }
      }
    } catch {}
    return getLocal('orders', INITIAL_ORDERS);
  },

  async updateOrderStatus(
    orderId: string,
    orderStatus: Order['orderStatus'],
    courierPartner?: string,
    trackingNumber?: string
  ): Promise<boolean> {
    const orders = await this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx] = {
        ...orders[idx],
        orderStatus,
        courierPartner: courierPartner || orders[idx].courierPartner,
        trackingNumber: trackingNumber || orders[idx].trackingNumber,
        updatedAt: new Date().toISOString(),
      };
      setLocal('orders', orders);
    }
    try {
      await fetch(`${STORE_API_BASE}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, courierPartner, trackingNumber }),
      });
    } catch {}
    return true;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${STORE_API_BASE}/api/admin/customers`);
      if (res.ok) {
        const data = await res.json();
        if (data.customers) {
          setLocal('customers', data.customers);
          return data.customers;
        }
      }
    } catch {}
    return getLocal('customers', INITIAL_CUSTOMERS);
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    try {
      const res = await fetch(`${STORE_API_BASE}/api/coupons`);
      if (res.ok) {
        const data = await res.json();
        if (data.coupons) {
          setLocal('coupons', data.coupons);
          return data.coupons;
        }
      }
    } catch {}
    return getLocal('coupons', INITIAL_COUPONS);
  },

  async saveCoupon(coupon: Coupon): Promise<boolean> {
    const coupons = await this.getCoupons();
    const idx = coupons.findIndex((c) => c.code === coupon.code);
    if (idx >= 0) {
      coupons[idx] = coupon;
    } else {
      coupons.unshift(coupon);
    }
    setLocal('coupons', coupons);
    try {
      await fetch(`${STORE_API_BASE}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
    } catch {}
    return true;
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch(`${STORE_API_BASE}/api/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setLocal('settings', data.settings);
          return data.settings;
        }
      }
    } catch {}
    return getLocal('settings', INITIAL_SETTINGS);
  },

  async saveSettings(settings: SiteSettings): Promise<boolean> {
    setLocal('settings', settings);
    try {
      await fetch(`${STORE_API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch {}
    return true;
  },
};
