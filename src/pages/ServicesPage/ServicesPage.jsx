// src/pages/ServicesPage/ServicesPage.jsx
import React, { useState, useEffect } from "react";
import { getServices } from "../../api/strapi";
import Loader from "../../components/Loader/Loader";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import styles from "./ServicesPage.module.css";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRes = await getServices();

        // UPDATED SORTING LOGIC:
        // 1. Add-Ons always go to the bottom.
        // 2. Within each group (Main Services OR Add-Ons), sort by ID ascending.
        const sortedServices = servicesRes.sort((a, b) => {
          // --- Primary Sort: IsAddOn ---
          // If 'a' is AddOn and 'b' is NOT, 'a' goes last (return 1)
          if (a.IsAddOn && !b.IsAddOn) return 1;
          // If 'a' is NOT AddOn and 'b' IS, 'a' goes first (return -1)
          if (!a.IsAddOn && b.IsAddOn) return -1;

          // --- Secondary Sort: By ID ---
          // If both are Main Services OR both are AddOns, sort by ID
          return a.id - b.id;
        });

        setServices(sortedServices);
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
