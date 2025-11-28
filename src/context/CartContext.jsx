// src/context/CartContext.jsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (service) => {
    const exists = cart.find((item) => item.documentId === service.documentId);
    if (exists) {
      alert("This service is already in your cart!");
      return;
    }
    setCart([...cart, service]);
  };

  const removeFromCart = (serviceId) => {
    setCart(cart.filter((item) => item.documentId !== serviceId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, service) => {
      const price = service.OnSalesPrice || service.Price || 0;
      return total + price;
    }, 0);
  };

  const getCartDeposit = () => {
    return cart.reduce((total, service) => {
      return total + service.Deposit;
    }, 0);
  };

  const getTotalDuration = () => {
    return cart.reduce((total, service) => {
      return total + (service.Duration || 0);
    }, 0);
  };

  const canAddService = (service) => {
    // If trying to add a main service (not an add-on)
    if (!service.IsAddOn) {
      // Check if there's already a main service in cart
      const hasMainService = cart.some((item) => !item.IsAddOn);
      if (hasMainService) {
        return false; // Can't add another main service
      }
    }
    // Add-ons can always be added
    return true;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartDeposit,
        getTotalDuration,
        canAddService,
        cartCount: cart.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
