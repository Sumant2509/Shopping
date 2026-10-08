'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Coupon } from './types';
import { calculateShippingFee } from './shipping';

interface CartContextType {
  items: OrderItem[];
  addItem: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeItem: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 699;
const FLAT_SHIPPING_FEE = 60;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sumant_craft_cart');
      const savedCoupon = localStorage.getItem('sumant_craft_coupon');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('sumant_craft_cart', JSON.stringify(items));
      if (coupon) {
        localStorage.setItem('sumant_craft_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('sumant_craft_coupon');
      }
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, coupon, isLoaded]);

  const addItem = (product: Product, quantity = 1, selectedColor?: string) => {
    const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard');
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.productId === product.id && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: OrderItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        mrp: product.mrp,
        quantity,
        selectedColor: color,
        image: product.images[0] || '/images/hero_doormat.jpg',
        dimensions: product.dimensions,
        shape: product.shape,
      };

      return [...prevItems, newItem];
    });

    setIsCartDrawerOpen(true);
  };

  const removeItem = (productId: string, selectedColor?: string) => {
    setItems(prev => prev.filter(item => !(item.productId === productId && (!selectedColor || item.selectedColor === selectedColor))));
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      removeItem(productId, selectedColor);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId && (!selectedColor || item.selectedColor === selectedColor)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Discount calculation
  let discount = 0;
  if (coupon) {
    if (subtotal >= coupon.minOrderValue) {
      if (coupon.discountPercent) {
        discount = Math.round((subtotal * coupon.discountPercent) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.discountAmount) {
        discount = Math.min(coupon.discountAmount, subtotal);
      }
    }
  }

  const shippingFee = calculateShippingFee(subtotal, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE);
  const totalAmount = Math.max(0, subtotal - discount + (items.length > 0 ? shippingFee : 0));
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    setCouponError(null);
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code' };
    }

    try {
      const res = await fetch(`/api/coupons?code=${cleanCode}`);
      const data = await res.json();

      if (!res.ok || !data.coupon) {
        const msg = data.error || 'Invalid coupon code';
        setCouponError(msg);
        return { success: false, message: msg };
      }

      const validCoupon: Coupon = data.coupon;
      if (subtotal < validCoupon.minOrderValue) {
        const msg = `This coupon requires a minimum cart value of ₹${validCoupon.minOrderValue}`;
        setCouponError(msg);
        return { success: false, message: msg };
      }

      setCoupon(validCoupon);
      return { success: true, message: `Coupon applied: ${validCoupon.description}` };
    } catch {
      const msg = 'Failed to validate coupon';
      setCouponError(msg);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        coupon,
        couponError,
        applyCoupon,
        removeCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        totalItems,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
