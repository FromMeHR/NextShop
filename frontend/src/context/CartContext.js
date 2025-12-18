import { useEffect, useState, createContext } from "react";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { PRODUCT_STOCK_STATUS } from "../constants/constants";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const outOfStockItems = cart.filter(
    (item) => item.product_stock_status === PRODUCT_STOCK_STATUS.OUT_OF_STOCK
  );
  const inStockItems = cart.filter(
    (item) => item.product_stock_status !== PRODUCT_STOCK_STATUS.OUT_OF_STOCK
  );
  const totalPrice = inStockItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );
  const totalWeight = inStockItems.reduce(
    (sum, item) => sum + item.product_weight * item.quantity,
    0
  );
  const totalQuantity = inStockItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/summary/`
        );
        setCart(response[0]?.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    if (!cart.some((item) => item.product_id === productId)) {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/summary/`,
          {
            method: "POST",
            data: { product_id: productId },
          }
        );
        setCart(response.items);
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateCartItem = async (itemId, newQuantity, oldQuantity = 0) => {
    if (newQuantity !== oldQuantity) {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/update-item/${itemId}/`,
          {
            method: "PATCH",
            data: { quantity: newQuantity },
          }
        );
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === itemId
              ? { ...item, quantity: response.quantity }
              : item
          )
        );
      } catch (error) {
        console.error("Error updating cart item:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const deleteCartItem = async (itemId) => {
    setIsLoading(true);
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/update-item/${itemId}/`,
        { method: "DELETE" }
      );
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting cart item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    cart,
    isLoading,
    outOfStockItems,
    inStockItems,
    totalPrice,
    totalWeight,
    totalQuantity,
    setCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
