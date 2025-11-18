// src/components/Footer/Footer.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { getGlobalData } from "../../api/strapi";
import styles from "./Footer.module.css";

const Footer = () => {
  const [globalData, setGlobalData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getGlobalData();
      setGlobalData(data);
    };
    fetchData();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brandSection}>
          <h3 className={styles.logo}>LashBabe_ng</h3>
          <p>Elevating beauty and building lash professionals.</p>
          <div className={styles.socials}>
            {globalData?.InstagramURL && (
              <a
                href={globalData.InstagramURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
            )}
            {globalData?.TikTokURL && (
              <a
                href={globalData.TikTokURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok />
              </a>
            )}
          </div>
        </div>

        <div className={styles.linksSection}>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/academy">Academy</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className={styles.contactSection}>
          <h4>Contact Info</h4>
          <p>{globalData?.Address}</p>
          <p>{globalData?.PhoneNumber}</p>
          <p>
            <a href={`mailto:${globalData?.EmailAddress}`}>
              {globalData?.EmailAddress}
            </a>
          </p>
        </div>
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} LashBabe_ng. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
