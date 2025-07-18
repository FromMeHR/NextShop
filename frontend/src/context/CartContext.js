import { useEffect, useState, createContext } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const outOfStockItems = cart.filter((item) => item.product_quantity === 0);
  const inStockItems = cart.filter((item) => item.product_quantity > 0);
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
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_API_URL}/api/cart/summary/`,
          { withCredentials: true }
        );
        setCart(response.data[0]?.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
      setIsLoading(false);
    };

    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    if (!cart.some((item) => item.product_id === productId)) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_API_URL}/api/cart/summary/`,
          { product_id: productId },
          { withCredentials: true }
        );
        setCart(response.data.items);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }
  };

  const updateCartItem = async (itemId, newQuantity, oldQuantity = 0) => {
    if (newQuantity !== oldQuantity) {
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_BASE_API_URL}/api/cart/update-item/${itemId}/`,
          { quantity: newQuantity },
          { withCredentials: true }
        );
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === itemId
              ? { ...item, quantity: response.data.quantity }
              : item
          )
        );
      } catch (error) {
        console.error("Error updating cart item:", error);
      }
    }
  };

  const deleteCartItem = async (itemId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_API_URL}/api/cart/update-item/${itemId}/`,
        { withCredentials: true }
      );
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting cart item:", error);
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
