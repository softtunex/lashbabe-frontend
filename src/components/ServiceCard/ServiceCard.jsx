// src/components/ServiceCard/ServiceCard.jsx
// Alternative version using documentId for Strapi v5 compatibility

import React from "react";
import { Link } from "react-router-dom";
import styles from "./ServiceCard.module.css";

const ServiceCard = ({ service }) => {
  // Use documentId for Strapi v5 - it's more reliable than numeric id
  const { documentId, id, Name, Duration, Price, Picture } = service;

  // Use documentId if available, fall back to id
  const serviceIdentifier = documentId || id;

  const strapiBaseUrl = process.env.REACT_APP_STRAPI_URL;

  const imageUrl = Picture?.url
    ? `${strapiBaseUrl}${Picture.url}`
    : "https://via.placeholder.com/400x300.png?text=No+Image";

  // Debug: log what we're using
  console.log("Service Card:", { id, documentId, using: serviceIdentifier });

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={Name} />
      </div>
      <div className={styles.content}>
        <h3>{Name}</h3>
        <div className={styles.details}>
          <span>Duration: {Duration}mins</span>
          <span>Price: ₦{Price.toLocaleString()}</span>
        </div>
        {/* Use the service identifier (documentId or id) */}
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
