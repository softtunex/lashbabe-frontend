// src/components/HeroSlider/HeroSlider.jsx
import React from "react";
import Slider from "react-slick";
import styles from "./HeroSlider.module.css";

const HeroSlider = ({ images }) => {
  const strapiBaseUrl = process.env.REACT_APP_STRAPI_URL;

  const settings = {
    dots: true,
    fade: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: false,
  };

  return (
    <div className={styles.sliderContainer}>
      <Slider {...settings}>
        {images.map((image) => (
          <div key={image.id}>
            <div
              className={styles.slide}
              style={{ backgroundImage: `url(${strapiBaseUrl}${image.url})` }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;
