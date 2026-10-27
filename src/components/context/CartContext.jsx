import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { storage } from '../utils/storage.js';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => storage.getCart() || []);

  useEffect(() => {
    storage.setCart(items);
  }, [items]);

  const addItem = useCallback((game) => {
    setItems((prev) => {
      if (prev.some((i) => String(i.id) === String(game.id))) return prev;
      return [...prev, { id: game.id, title: game.title, price: game.price, image: game.image || game.cover }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.price) || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, clear, subtotal, count: items.length }),
    [items, addItem, removeItem, clear, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}