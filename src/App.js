// src/App.js
import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaGift } from "react-icons/fa";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer"; // Import Footer
import PromotionModal from "./components/PromotionModal/PromotionModal"; // Import the modal
import { getActivePromotions } from "./api/strapi"; // Import the new API function
import Homepage from "./pages/Homepage/Homepage";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import AcademyPage from "./pages/AcademyPage/AcademyPage";
import AboutPage from "./pages/AboutPage/AboutPage"; // Import AboutPage
import ContactPage from "./pages/ContactPage/ContactPage"; // Import ContactPage

const promoIconStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  backgroundColor: "var(--color-charcoal)",
  color: "white",
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  zIndex: 999,
};

function App() {
  const [promotions, setPromotions] = useState([]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      const promoData = await getActivePromotions();
      setPromotions(promoData);

      // --- SESSION LOGIC ---
      // Check sessionStorage to see if the modal has been shown in this session
      const hasSeenPromo = sessionStorage.getItem("hasSeenPromo");

      // If there are promotions AND the user hasn't seen them yet...
      if (promoData.length > 0 && !hasSeenPromo) {
        setIsPromoModalOpen(true); // Open the modal automatically
        sessionStorage.setItem("hasSeenPromo", "true"); // Mark as seen
      }
    };

    fetchPromotions();
  }, []);

  const openPromoModal = () => setIsPromoModalOpen(true);
  const closePromoModal = () => setIsPromoModalOpen(false);

  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/booking/:serviceId" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />{" "}
          {/* Add About route */}
          <Route path="/contact" element={<ContactPage />} />{" "}
          {/* Add Contact route */}
        </Routes>
      </main>
      <Footer /> {/* Add Footer */}
      {/* --- PROMOTION FEATURE --- */}
      {/* The fixed icon to re-open the modal */}
      <div style={promoIconStyle} onClick={openPromoModal}>
        <FaGift />
      </div>
      {/* The modal, which only renders when open */}
      {isPromoModalOpen && (
        <PromotionModal promotions={promotions} onClose={closePromoModal} />
      )}
    </div>
  );
}

export default App;
