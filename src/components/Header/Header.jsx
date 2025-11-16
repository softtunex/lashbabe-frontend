// src/components/Header/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import styles from "./Header.module.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu} />} */}

      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          LashBabe
        </Link>{" "}
        {/* Use Link for the logo */}
        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link to="/services">Services</Link> {/* Use Link */}
          <a href="/#about">About</a> {/* Keep as anchor for now */}
          <a href="/#academy">Academy</a> {/* Keep as anchor for now */}
          <a href="/#contact">Contact</a> {/* Keep as anchor for now */}
        </nav>
        {/* Burger Icon for Mobile */}
        <div className={styles.burger} onClick={toggleMenu}>
          <div />
          <div />
          <div />
        </div>
        {/* Mobile Navigation Menu (slides in) */}
        <nav className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ""}`}>
          <button className={styles.closeButton} onClick={toggleMenu}>
            &times;
          </button>
          <Link to="/services" onClick={toggleMenu}>
            Services
          </Link>{" "}
          {/* Use Link */}
          <a href="/#about" onClick={toggleMenu}>
            About
          </a>
          <a href="/#academy" onClick={toggleMenu}>
            Academy
          </a>
          <a href="/#contact" onClick={toggleMenu}>
            Contact
          </a>
        </nav>
      </header>
    </>
  );
};

export default Header;
