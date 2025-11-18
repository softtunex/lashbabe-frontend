// src/pages/ContactPage/ContactPage.jsx
import React, { useState, useEffect } from "react";
import { getGlobalData } from "../../api/strapi";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import Loader from "../../components/Loader/Loader";
import styles from "./ContactPage.module.css";

const ContactPage = () => {
  const [globalData, setGlobalData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getGlobalData();
      setGlobalData(data);
    };
    fetchData();
  }, []);

  if (!globalData) {
    return <Loader />;
  }

  return (
    <div className={styles.contactPage}>
      <h1>Contact Us</h1>
      <p className={styles.subtitle}>
        We'd love to hear from you. Reach out with any questions or to book your
        next appointment.
      </p>
      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <FaMapMarkerAlt className={styles.icon} />
          <h3>Our Studio</h3>
          <p>{globalData.Address}</p>
        </div>
        <div className={styles.contactCard}>
          <FaPhone className={styles.icon} />
          <h3>Phone</h3>
          <p>{globalData.PhoneNumber}</p>
        </div>
        <div className={styles.contactCard}>
          <FaEnvelope className={styles.icon} />
          <h3>Email</h3>
          <p>
            <a href={`mailto:${globalData.EmailAddress}`}>
              {globalData.EmailAddress}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
