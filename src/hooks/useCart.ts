import { useCallback, useRef, useState } from "react";
import { cartApi } from "../apis/cart";
import type { CartItemInfo } from "../types/CartItemInfo";

export default function useCart() {
  const [cartItems, setCartItems] = useState<CartItemInfo[]>([]);
  const [processingSet, setProcessingSet] = useState<Set<number>>(new Set());

  // 장바구니 목록 불러오기
  const fetchCart = useCallback(async () => {
    try {
      const cartResponse = await cartApi.getCartItems();
      const items = cartResponse.cartItems.map((item: any) => ({
        classId: item.classId,
        cartItemId: item.cartItemId,
      }));
      setCartItems(items);
    } catch {
      setCartItems([]);
    }
  }, []);

  // 장바구니 토글 (낙관적 UI, 실패 시 롤백)
  const toggleCart = useCallback(
    async (classId: number, isInCart: boolean) => {
      if (processingSet.has(classId)) return;
      const newSet = new Set(processingSet);
      newSet.add(classId);
      setProcessingSet(newSet);

      const prevCartItems = [...cartItems];
      setCartItems((prev) =>
        isInCart
          ? prev.filter((item) => item.classId !== classId)
          : [...prev, { classId, cartItemId: -1 }]
      );

      try {
        if (!isInCart) {
          await cartApi.addToCart(classId);
        } else {
          const found = prevCartItems.find((item) => item.classId === classId);
          if (found) {
            await cartApi.removeFromCart([found.cartItemId]);
          } else {
            throw new Error("기존 장바구니 정보 없음");
          }
        }
      } catch (err) {
        setCartItems(prevCartItems); // 실패 시 롤백
      } finally {
        try {
          const cartResponse = await cartApi.getCartItems();
          const items = cartResponse.cartItems.map((item: any) => ({
            classId: item.classId,
            cartItemId: item.cartItemId,
          }));
          setCartItems(items);
        } catch {
          // 무시
        }
        const updated = new Set(processingSet);
        updated.delete(classId);
        setProcessingSet(updated);
      }
    },
    [cartItems, processingSet]
  );

  return {
    cartItems,
    processingSet,
    fetchCart,
    toggleCart,
  };
} 