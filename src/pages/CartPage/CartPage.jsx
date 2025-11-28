// src/pages/CartPage/CartPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getServices } from "../../api/strapi"; // Import API to fetch suggestions
import { FaTrash, FaShoppingCart, FaPlus } from "react-icons/fa";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    removeFromCart,
    getCartTotal,
    getCartDeposit,
    getTotalDuration,
    clearCart,
  } = useCart();

  const [suggestedAddOns, setSuggestedAddOns] = useState([]);

  // Fetch all services to find add-ons not in cart
  useEffect(() => {
    const fetchSuggestions = async () => {
      const allServices = await getServices();

      // Filter: Must be an AddOn AND not already in the cart
      const addOns = allServices.filter(
        (service) =>
          service.IsAddOn &&
          !cart.some((cartItem) => cartItem.documentId === service.documentId)
      );
      setSuggestedAddOns(addOns);
    };
    fetchSuggestions();
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <FaShoppingCart className={styles.emptyIcon} />
        <h2>No Service Selected</h2>
        <p>Add some services to get started!</p>
        <button
          className={styles.btnPrimary}
          onClick={() => navigate("/services")}
        >
          Browse Services
        </button>
      </div>
    );
  }

  const handleProceedToBooking = () => {
    navigate("/booking");
  };

  // Sort Cart: Main Services First, Add-Ons Last
  const sortedCart = [...cart].sort((a, b) => {
    if (a.IsAddOn && !b.IsAddOn) return 1;
    if (!a.IsAddOn && b.IsAddOn) return -1;
    return 0;
  });

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartContainer}>
        <h1>Your Selected Service(s)</h1>

        <div className={styles.cartItems}>
          {sortedCart.map((service) => {
            const price = service.OnSalesPrice || service.Price || 0;
            const isAddOn = service.IsAddOn;

            return (
              <div key={service.documentId} className={styles.cartItem}>
                {service.Picture?.url ? (
                  <img src={service.Picture.url} alt={service.Name} />
                ) : (
                  <div className={styles.placeholderImage}>
                    <FaShoppingCart />
                  </div>
                )}

                <div className={styles.itemDetails}>
                  <h3>
                    {service.Name}
                    {isAddOn && (
                      <span className={styles.addOnBadge}>Add-On</span>
                    )}
                  </h3>
                  <p className={styles.duration}>{service.Duration} mins</p>
                  <p className={styles.price}>₦{price.toLocaleString()}</p>
                </div>

                <button
                  className={styles.removeButton}
                  onClick={() => removeFromCart(service.documentId)}
                  aria-label="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>

        {/* --- NEW: Suggested Add-Ons Section --- */}
        {suggestedAddOns.length > 0 && (
          <div className={styles.suggestionsSection}>
            <h3>Would you like to add?</h3>
            <div className={styles.suggestionsGrid}>
              {suggestedAddOns.map((addon) => (
                <div key={addon.documentId} className={styles.suggestionCard}>
                  <div className={styles.suggestionInfo}>
                    <h4>{addon.Name}</h4>
                    <p>
                      ₦{(addon.OnSalesPrice || addon.Price).toLocaleString()} •{" "}
                      {addon.Duration}m
                    </p>
                  </div>
                  <button
                    className={styles.addSuggestionBtn}
                    onClick={() => addToCart(addon)}
                  >
                    <FaPlus /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.cartSummary}>
          <div className={styles.summaryRow}>
            <span>Total Duration:</span>
            <strong>{getTotalDuration()} mins</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Total Price:</span>
            <strong>₦{getCartTotal().toLocaleString()}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Deposit Required:</span>
            <strong>₦{getCartDeposit().toLocaleString()}</strong>
          </div>
        </div>

        <div className={styles.cartActions}>
          <button className={styles.btnSecondary} onClick={clearCart}>
            Clear Cart
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleProceedToBooking}
          >
            Proceed to Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
