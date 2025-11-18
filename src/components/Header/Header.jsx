// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { getGlobalData } from "../../api/strapi"; // We can reuse this function!

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [globalData, setGlobalData] = useState(null); // State for our global data
  const navigate = useNavigate();

  // Fetch the global data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const data = await getGlobalData();
      setGlobalData(data);
    };
    fetchData();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMobileLinkClick = (path) => {
    navigate(path);
    toggleMenu();
  };

  // const strapiBaseUrl = process.env.REACT_APP_STRAPI_URL;
  const logoUrl = globalData?.Logo?.url;
  // ? `${strapiBaseUrl}${globalData.Logo.url}`
  // : null;

  return (
    <>
      {/* {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu} />} */}

      <header className={styles.header}>
        <Link to="/" className={styles.logoLink}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="LashBabe Logo"
              className={styles.logoImage}
            />
          ) : (
            <span className={styles.logoText}>LashBabe</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/services">Services</Link>
          <Link to="/academy">Academy</Link>
          <Link to="/about">About</Link> {/* Will link to new page */}
          <Link to="/contact">Contact</Link> {/* Will link to new page */}
        </nav>

        {/* Burger Icon for Mobile */}
        <div className={styles.burger} onClick={toggleMenu}>
          <div />
          <div />
          <div />
        </div>

        {/* Mobile Navigation Menu */}
        <nav className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ""}`}>
          <button className={styles.closeButton} onClick={toggleMenu}>
            &times;
          </button>
          <div
            className={styles.mobileLink}
            onClick={() => handleMobileLinkClick("/services")}
          >
            Services
          </div>
          <div
            className={styles.mobileLink}
            onClick={() => handleMobileLinkClick("/academy")}
          >
            Academy
          </div>
          <div
            className={styles.mobileLink}
            onClick={() => handleMobileLinkClick("/about")}
          >
            About
          </div>
          <div
            className={styles.mobileLink}
            onClick={() => handleMobileLinkClick("/contact")}
          >
            Contact
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
