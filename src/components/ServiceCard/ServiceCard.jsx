// src/components/ServiceCard/ServiceCard.jsx
import React from "react";
import { Link } from "react-router-dom";
// 1. Import the icon you want to use
import { GiEyelashes } from "react-icons/gi";
import styles from "./ServiceCard.module.css";

const ServiceCard = ({ service }) => {
  const {
    documentId,
    id,
    Name,
    Duration,
    Price,
    Picture,
    OnSalesPrice,
    OnSaleTitle,
  } = service;

  const serviceIdentifier = documentId || id;

  // 2. Check if the service is on sale
  const isOnSale = OnSalesPrice && OnSalesPrice > 0;

  // 3. Check if an image exists
  const hasImage = Picture && Picture.url;

  return (
    <div className={styles.card}>
      {/* --- SALE BANNER --- */}
      {isOnSale && OnSaleTitle && (
        <div className={styles.saleBanner}>{OnSaleTitle}</div>
      )}

      {/* --- IMAGE OR ICON LOGIC --- */}
      <div className={styles.imageContainer}>
        {hasImage ? (
          // If image exists:
          <img src={Picture.url} alt={Name} />
        ) : (
          // If NO image exists:
          <div className={styles.placeholder}>
            <GiEyelashes className={styles.placeholderIcon} />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3>{Name}</h3>
        <div className={styles.details}>
          <span>Duration: {Duration}mins</span>

          {/* --- CONDITIONAL PRICE DISPLAY --- */}
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

        <Link
          to={`/booking/${serviceIdentifier}`}
          className={styles.bookButtonLink}
        >
          <button className={styles.bookButton}>Book Now</button>
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
