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
      // Agar o'yin allaqachon savatda bo'lsa, uni qayta qo'shmaymiz
      if (prev.some((i) => String(i.id) === String(game.id))) return prev;

      // Narxlarni hisoblash
      const discount = Number(game.discount) || 0;
      const originalPrice = Number(game.price) || 0;
      const finalPrice = game.finalPrice != null 
        ? Number(game.finalPrice) 
        : (discount > 0 ? originalPrice - (originalPrice * discount / 100) : originalPrice);

      return [...prev, {
        id: game.id,
        title: game.title,
        price: originalPrice,
        discount: discount,
        finalPrice: finalPrice,
        image: game.image || game.cover,
        currency: game.currency || 'USD',
        isBundle: game.isBundle || false,
      }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  // Subtotal endi finalPrice (chegirmali narx) bo'yicha hisoblanadi
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.finalPrice ?? i.price) || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, clear, subtotal, count: items.length }),
    [items, addItem, removeItem, clear, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}