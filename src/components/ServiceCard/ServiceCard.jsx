// src/components/ServiceCard/ServiceCard.jsx
import React from "react";
import { Link } from "react-router-dom";
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
  // const strapiBaseUrl = process.env.REACT_APP_STRAPI_URL;

  const imageUrl =
    Picture?.url || "https://via.placeholder.com/400x300.png?text=No+Image";

  // Check if the service is on sale
  const isOnSale = OnSalesPrice && OnSalesPrice > 0;

  return (
    <div className={styles.card}>
      {/* --- SALE BANNER --- */}
      {isOnSale && OnSaleTitle && (
        <div className={styles.saleBanner}>{OnSaleTitle}</div>
      )}

      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={Name} />
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
