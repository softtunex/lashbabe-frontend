// src/App.js
import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaGift } from "react-icons/fa";
import { CartProvider } from "./context/CartContext"; // Import CartProvider
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import PromotionModal from "./components/PromotionModal/PromotionModal";
import { getActivePromotions } from "./api/strapi";
import Homepage from "./pages/Homepage/Homepage";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import CartPage from "./pages/CartPage/CartPage"; // New cart page
import AcademyPage from "./pages/AcademyPage/AcademyPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import PolicyPage from "./pages/PolicyPage/PolicyPage";

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

      const hasSeenPromo = sessionStorage.getItem("hasSeenPromo");

      if (promoData.length > 0 && !hasSeenPromo) {
        setIsPromoModalOpen(true);
        sessionStorage.setItem("hasSeenPromo", "true");
      }
    };

    fetchPromotions();
  }, []);

  const openPromoModal = () => setIsPromoModalOpen(true);
  const closePromoModal = () => setIsPromoModalOpen(false);

  return (
    <CartProvider>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/booking" element={<BookingPage />} />{" "}
            {/* Cart-based booking */}
            <Route path="/booking/:serviceId" element={<BookingPage />} />{" "}
            {/* Single service booking */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />

        <div style={promoIconStyle} onClick={openPromoModal}>
          <FaGift />
        </div>

        {isPromoModalOpen && (
          <PromotionModal promotions={promotions} onClose={closePromoModal} />
        )}
      </div>
    </CartProvider>
  );
}

export default App;
