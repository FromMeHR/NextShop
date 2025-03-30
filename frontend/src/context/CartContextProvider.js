import { useEffect, useState } from "react";
import axios from "axios";
import { CartContext } from "./CartContext";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const outOfStockItems = cart.filter(item => item.product_quantity === 0);
  const inStockItems = cart.filter(item => item.product_quantity > 0);
  const totalPrice = inStockItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity, 0
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
    };

    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    if (!cart.some(item => item.product_id === productId)) {
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
        setCart(prevCart => prevCart.map(item =>
            item.id === itemId ? { ...item, quantity: response.data.quantity } : item
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
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };  

  return (
    <CartContext.Provider value={{ cart, outOfStockItems, inStockItems, totalPrice, 
      addToCart, updateCartItem, deleteCartItem }}>
      {children}
    </CartContext.Provider>
  );
};