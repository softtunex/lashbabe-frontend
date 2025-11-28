// src/components/CartIcon/CartIcon.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import styles from "./CartIcon.module.css";

const CartIcon = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleClick = () => {
    navigate("/cart");
  };

  return (
    <div className={styles.cartIcon} onClick={handleClick}>
      <FaShoppingCart className={styles.icon} />
      {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
    </div>
  );
};

export default CartIcon;
