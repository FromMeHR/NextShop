import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();

const generateCartCode = (length) => {
  let result = "";
  while (result.length < length) {
    result += Math.random().toString(36).substring(2);
  }
  return result.substring(0, length);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCode] = useState(
    localStorage.getItem("cart_code") || generateCartCode(32)
  );

  useEffect(() => {
    localStorage.setItem("cart_code", cartCode);
  }, [cartCode]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_API_URL}/api/cart/`,
          { params: { cart_code: cartCode } }
        );
        setCart(response.data[0]?.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [cartCode]);

  const addToCart = async (productId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_API_URL}/api/cart/`,
        { cart_code: cartCode, product_id: productId }
      );
      setCart(response.data.items);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);