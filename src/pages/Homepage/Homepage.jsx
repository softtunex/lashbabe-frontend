// src/pages/Homepage/Homepage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import the Link component
import { getHomepageData, getServices } from "../../api/strapi";
import styles from "./Homepage.module.css";
import Loader from "../../components/Loader/Loader";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import ServiceCard from "../../components/ServiceCard/ServiceCard";

const Homepage = () => {
  const [homepageData, setHomepageData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [homepageRes, servicesRes] = await Promise.all([
          getHomepageData(),
          getServices(),
        ]);
        setHomepageData(homepageRes);
        setServices(servicesRes);
      } catch (error) {
        console.error("Failed to fetch page data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!homepageData) {
    return <div>Failed to load content. Please try again later.</div>;
  }

  let sliderImages = [];
  if (Array.isArray(homepageData.SliderImages)) {
    sliderImages = homepageData.SliderImages;
  }

  return (
    <main className={styles.homepage}>
      <section className={styles.hero}>
        {sliderImages.length > 0 && <HeroSlider images={sliderImages} />}
        <div className={styles.heroContent}>
          <h1>{homepageData.HeroTitle}</h1>
          <p>{homepageData.HeroSubtitle}</p>

          {/* --- THIS IS THE FIX --- */}
          <div className={styles.ctaButtons}>
            <Link to="/services" className={styles.linkWrapper}>
              <button className={styles.btnPrimary}>Book An Appointment</button>
            </Link>
            <Link to="/academy" className={styles.linkWrapper}>
              <button className={styles.btnSecondary}>Join The Academy</button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.servicesSection}>
        <h2>Our Signature Services</h2>
        <div className={styles.servicesGrid}>
          {services.slice(0, 3).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Homepage;
