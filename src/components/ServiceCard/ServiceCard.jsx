// src/components/ServiceCard/ServiceCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { GiEyelashes } from "react-icons/gi";
import { useCart } from "../../context/CartContext";
import styles from "./ServiceCard.module.css";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const { addToCart, canAddService, cart } = useCart();
  const {
    documentId,
    Name,
    Duration,
    Price,
    Picture,
    OnSalesPrice,
    OnSaleTitle,
    IsAddOn,
  } = service;

  const isOnSale = OnSalesPrice && OnSalesPrice > 0;
  const hasImage = Picture && Picture.url;
  const isInCart = cart.some((item) => item.documentId === documentId);

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!canAddService(service)) {
      alert(
        "You can only book ONE main service at a time. You can add multiple add-ons to your booking."
      );
      return;
    }

    addToCart(service);
  };

  const handleBookNow = (e) => {
    e.preventDefault();

    if (!isInCart) {
      if (!canAddService(service)) {
        alert(
          "You can only book ONE main service at a time. You can add multiple add-ons to your booking."
        );
        return;
      }
      addToCart(service);
    }

    navigate("/cart");
  };

  // Dynamic Button Text
  const addButtonText = IsAddOn ? "Add Add-On" : "Add Service";

  return (
    <div className={styles.card}>
      {isOnSale && OnSaleTitle && (
        <div className={styles.saleBanner}>{OnSaleTitle}</div>
      )}

      {IsAddOn && <div className={styles.addOnBadge}>Add-On</div>}

      <div className={styles.imageContainer}>
        {hasImage ? (
          <img src={Picture.url} alt={Name} />
        ) : (
          <div className={styles.placeholder}>
            <GiEyelashes className={styles.placeholderIcon} />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3>{Name}</h3>
        <div className={styles.details}>
          <span>Duration: {Duration}mins</span>

          {isOnSale ? (
            <div className={styles.priceContainer}>
              <span className={styles.salePrice}>
                ₦{OnSalesPrice.toLocaleString()}
              </span>
              <s className={styles.originalPrice}>₦{Price.toLocaleString()}</s>
            </div>
          ) : (
            <span className={styles.price}>₦{Price.toLocaleString()}</span>
          )}
        </div>

        <div className={styles.buttonGroup}>
          {!isInCart ? (
            <>
              <button
                className={styles.addToCartButton}
                onClick={handleAddToCart}
              >
                {addButtonText}
              </button>
              <button className={styles.bookButton} onClick={handleBookNow}>
                Book Now
              </button>
            </>
          ) : (
            <button
              className={styles.inCartButton}
              onClick={() => navigate("/cart")}
            >
              ✓ Added - View Service
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
