// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { getGlobalData } from "../../api/strapi";
import CartIcon from "../CartIcon/CartIcon"; // Import CartIcon

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [globalData, setGlobalData] = useState(null);
  const navigate = useNavigate();

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

  const logoUrl = globalData?.Logo?.url;

  return (
    <>
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
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/policy">Policy</Link>
          <CartIcon /> {/* Cart icon for desktop */}
        </nav>

        {/* Mobile right section: Cart + Burger */}
        <div className={styles.mobileRight}>
          <CartIcon /> {/* Cart icon for mobile */}
          {/* Burger Icon for Mobile */}
          <div className={styles.burger} onClick={toggleMenu}>
            <div />
            <div />
            <div />
          </div>
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
          <div
            className={styles.mobileLink}
            onClick={() => handleMobileLinkClick("/policy")}
          >
            Policy
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
