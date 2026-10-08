export type MatShape = 'flower' | 'round' | 'oval' | 'rectangle' | 'square' | 'semi-circle' | 'custom' | 'arch' | 'capsule' | 'heart' | 'hexagon' | 'starburst';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent: number;
  shape: MatShape;
  dimensions: string; // e.g., "Diameter: 20 inches / 50.8 cm"
  thickness: string; // e.g., "0.6 cm / 6 mm"
  material: string; // e.g., "Handmade Braided Cotton Textile"
  washability: string; // e.g., "Hand Washable & Gentle Machine Washable"
  craftType: string; // e.g., "Handmade Crochet / Hand-braided"
  colors: string[];
  images: string[];
  stock: number;
  sku: string;
  category: string;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  inStock: boolean;
  tags: string[];
  features: string[];
  createdAt: string;
}

export interface CustomerAddress {
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: CustomerAddress;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  quantity: number;
  selectedColor?: string;
  image: string;
  dimensions: string;
  shape: string;
  customDetails?: {
    shape?: string;
    widthInches?: number;
    heightInches?: number;
    primaryColor?: string;
    secondaryColor?: string;
    borderStyle?: string;
    customText?: string;
  };
}

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'COD';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
export type OrderStatus =
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDeliveryDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  description: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  city: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  isApproved: boolean;
}

export interface SiteSettings {
  storeName: string;
  ownerName: string;
  tagline: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  workshopAddress: string;
  enableCOD: boolean;
  codFee: number;
  freeShippingThreshold: number;
  flatShippingRate: number;
  announcementText: string;
  bannerHeading: string;
  bannerSubheading: string;
  amazonStoreUrl?: string;
  flipkartStoreUrl?: string;
  instagramUrl?: string;
  returnWindowDays: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CustomerPublic {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: CustomerAddress[];
  createdAt: string;
}
