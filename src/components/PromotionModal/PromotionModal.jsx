// src/components/PromotionModal/PromotionModal.jsx
import React from "react";
import Slider from "react-slick";
import styles from "./PromotionModal.module.css";
import { FaGift } from "react-icons/fa";
import { BlocksRenderer } from "@strapi/blocks-react-renderer"; // Import the renderer

const PromotionModal = ({ promotions, onClose }) => {
  //   const strapiBaseUrl = process.env.REACT_APP_STRAPI_URL;

  const sliderSettings = {
    dots: true,
    infinite: promotions.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  if (!promotions || promotions.length === 0) {
    // ... (the "no promotions" JSX remains the same)
    return (
      <>
        <div className={styles.overlay} onClick={onClose} />
        <div className={styles.modal}>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
          <div className={styles.noPromoContent}>
            <FaGift className={styles.noPromoIcon} />
            <h3>No Special Offers Today</h3>
            <p>Check back soon for our next promotion!</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <Slider {...sliderSettings}>
          {promotions.map((promo) => {
            const imageUrl = promo.Image?.url;

            return (
              <div key={promo.id} className={styles.slide}>
                {imageUrl ? (
                  <div className={styles.imageContainer}>
                    <img src={imageUrl} alt={promo.Title} />
                  </div>
                ) : (
                  <div className={styles.noImageFallback}>
                    <FaGift />
                  </div>
                )}
                <div className={styles.promoContent}>
                  <h2>{promo.Title}</h2>

                  {/* --- THIS IS THE FIX --- */}
                  {/* We now use the BlocksRenderer for the description */}
                  {promo.Description && (
                    <BlocksRenderer content={promo.Description} />
                  )}
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </>
  );
};

export default PromotionModal;
