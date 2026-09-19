import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem, CartItem, OrderItem } from './types';
import { INITIAL_CART_ITEMS, MOCK_ACTIVE_ORDER } from './mock-data';
import { api } from './api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductItem, quantityKg?: number) => void;
  addItem: (product: ProductItem, quantityKg?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantityKg: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  activeOrder: OrderItem;
  currentOrder: {
    id: string;
    orderDate: string;
    total: number;
    paymentStatus: string;
    farmerName: string;
    deliveryAddress: string;
    items: CartItem[];
  };
  placeOrder: (details: {
    address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    deliveryMethod: 'Standard Delivery' | 'Farmer Pickup';
    paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery';
  }) => OrderItem;
  updateOrderStatus: (statusIndex: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'agrisetu_cart_items_v1';
const ORDER_STORAGE_KEY = 'agrisetu_active_order_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CART_ITEMS;
  });

  const [activeOrder, setActiveOrder] = useState<OrderItem>(() => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_ACTIVE_ORDER;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(activeOrder));
    } catch {
      // ignore
    }
  }, [activeOrder]);

  const addToCart = (product: ProductItem, quantityKg = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantityKg: item.quantityKg + quantityKg }
            : item
        );
      }
      return [...prev, { product, quantityKg }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantityKg: number) => {
    if (quantityKg <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantityKg } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.pricePerKg * item.quantityKg,
    0
  );

  const deliveryFee = items.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const placeOrder = (details: {
    address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    deliveryMethod: 'Standard Delivery' | 'Farmer Pickup';
    paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery';
  }): OrderItem => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FW-2026-${randomSuffix}`;

    const newOrder: OrderItem = {
      id: `ord_fw_${randomSuffix}`,
      orderNumber,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      items: [...items],
      subtotal,
      deliveryFee,
      total,
      paymentMethod: details.paymentMethod,
      paymentStatus: details.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      deliveryAddress: details.address,
      deliveryMethod: details.deliveryMethod,
      currentStatusIndex: 1, // Payment confirmed / order placed
      farmerName: items[0]?.product.farmerName || 'Rudra Patel',
      farmerPhone: '+91 98251 44321'
    };

    // Asynchronously sync to backend database
    api.orders.create({
      items: items.map(it => ({
        listing_id: String(it.product.id),
        quantity_kg: it.quantityKg,
        crop_name: it.product.name,
        price_per_kg: it.product.pricePerKg,
        farmer_id: it.product.farmerId,
      })),
      delivery_name: details.address.name,
      delivery_phone: details.address.phone,
      delivery_address: details.address.address,
      delivery_city: details.address.city,
      delivery_state: details.address.state,
      delivery_pincode: details.address.pincode,
      payment_method: details.paymentMethod,
      delivery_method: details.deliveryMethod,
    }).then(res => {
      if (res.data?.order_id) {
        newOrder.id = String(res.data.order_id);
        if (res.data.order_number) {
          newOrder.orderNumber = res.data.order_number;
        }
        setActiveOrder({ ...newOrder });
      }
    }).catch(err => {
      console.warn('Backend order sync fallback:', err);
    });

    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (statusIndex: number) => {
    setActiveOrder(prev => ({
      ...prev,
      currentStatusIndex: Math.min(5, Math.max(0, statusIndex))
    }));
  };

  const currentOrder = {
    id: activeOrder.orderNumber || 'FW-2026-8812',
    orderDate: activeOrder.date || 'Today, 02:40 PM',
    total: activeOrder.total || 474,
    paymentStatus: activeOrder.paymentStatus || 'Confirmed',
    farmerName: activeOrder.farmerName || 'Rudra Patel',
    deliveryAddress: typeof activeOrder.deliveryAddress === 'string'
      ? activeOrder.deliveryAddress
      : `${activeOrder.deliveryAddress?.address || 'B-402, Green Orchid Residency'}, ${activeOrder.deliveryAddress?.city || 'Ahmedabad'}`,
    items: activeOrder.items || []
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addItem: addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        activeOrder,
        currentOrder,
        placeOrder,
        updateOrderStatus
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
