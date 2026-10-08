export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent: number;
  shape: 'flower' | 'round' | 'oval' | 'rectangle' | 'starburst' | string;
  dimensions: string;
  thickness: string;
  material: string;
  washability: string;
  craftType: string;
  colors: string[];
  images: string[];
  stock: number;
  sku: string;
  category: string;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  inStock: boolean;
  tags: string[];
  features: string[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  shape?: string;
  image?: string;
  dimensions?: string;
}

export interface CustomerAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: CustomerAddress;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  courierPartner?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
  description: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  address: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  codEnabled: boolean;
  announcementText: string;
}
