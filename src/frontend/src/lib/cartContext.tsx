import type React from "react";
import { createContext, useContext, useState } from "react";

export interface CartItem {
  serviceId: string;
  serviceName: string;
  price: number;
  qty: number;
  notes: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "qty" | "notes">) => void;
  removeFromCart: (serviceId: string) => void;
  updateQty: (serviceId: string, qty: number) => void;
  updateNotes: (serviceId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "qty" | "notes">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.serviceId === item.serviceId);
      if (existing) {
        return prev.map((i) =>
          i.serviceId === item.serviceId ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...item, qty: 1, notes: "" }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
  };

  const updateQty = (serviceId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.serviceId === serviceId ? { ...i, qty } : i)),
    );
  };

  const updateNotes = (serviceId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.serviceId === serviceId ? { ...i, notes } : i)),
    );
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        updateNotes,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
