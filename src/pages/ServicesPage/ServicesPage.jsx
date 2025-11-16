// src/pages/ServicesPage/ServicesPage.jsx
import React, { useState, useEffect } from "react";
import { getServices } from "../../api/strapi";
import Loader from "../../components/Loader/Loader";
import ServiceCard from "../../components/ServiceCard/ServiceCard"; // Reusing our component!
import styles from "./ServicesPage.module.css";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRes = await getServices();
        setServices(servicesRes);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.servicesPage}>
      <div className={styles.pageHeader}>
        <h1>Our Services</h1>
        <p>Discover the perfect treatment to enhance your natural beauty.</p>
      </div>
      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
