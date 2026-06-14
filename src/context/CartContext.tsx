'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // Dynamic unique key generated based on options
  frameId: string;
  title: string;
  imageUrl: string;
  sizeId: string;
  customWidth?: number;
  customHeight?: number;
  materialId: string;
  glassTypeId: string;
  borderId: string;
  customBorderColor: string;
  orientation: 'portrait' | 'landscape';
  quantity: number;
  price: number; // Unit price
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate unique hash based on configurations
function generateCartItemId(item: Omit<CartItem, 'id'>): string {
  const parts = [
    item.frameId,
    item.sizeId,
    item.sizeId === 'custom' ? `${item.customWidth}x${item.customHeight}` : '',
    item.materialId,
    item.glassTypeId,
    item.borderId,
    item.borderId === 'custom-border' ? item.customBorderColor : '',
    item.orientation
  ];
  return parts.filter(Boolean).join('_');
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('photo_frame_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage when changed
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('photo_frame_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const id = generateCartItemId(newItem);
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === id);

      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, { ...newItem, id }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
