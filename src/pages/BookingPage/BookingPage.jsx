// src/pages/BookingPage/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getServiceById, getBookingPolicy } from "../../api/strapi";
import styles from "./BookingPage.module.css";
import Loader from "../../components/Loader/Loader";

// Import booking step components
import SelectDateTime from "../../components/BookingSteps/SelectDateTime";
import EnterDetails from "../../components/BookingSteps/EnterDetails";
import Confirmation from "../../components/BookingSteps/Confirmation";

const BookingPage = () => {
  const { serviceId } = useParams(); // Will be undefined if coming from cart
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]); // Services to book (from cart or single)
  const [bookingPolicy, setBookingPolicy] = useState(null);

  useEffect(() => {
    const initBooking = async () => {
      if (serviceId) {
        // Single service booking (direct from service card)
        const serviceData = await getServiceById(serviceId);
        if (serviceData) {
          setServices([serviceData]);
        } else {
          navigate("/services");
          return;
        }
      } else {
        // Cart-based booking
        if (cart.length === 0) {
          navigate("/services");
          return;
        }
        setServices(cart);
      }

      const policy = await getBookingPolicy();
      setBookingPolicy(policy);
      setLoading(false);
    };

    initBooking();
  }, [serviceId, cart, navigate]);

  const handleNextStep = (data) => {
    setBookingDetails({ ...bookingDetails, ...data });
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleBookingComplete = () => {
    // Only clear cart if booking was from cart (not single service)
    if (!serviceId) {
      clearCart();
    }
  };

  if (loading) return <Loader />;

  if (services.length === 0) {
    return <div>Redirecting...</div>;
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SelectDateTime
            onNext={handleNextStep}
            styles={styles}
            services={services}
          />
        );
      case 2:
        return (
          <EnterDetails
            onNext={handleNextStep}
            onBack={handlePrevStep}
            bookingDetails={bookingDetails}
            services={services}
            styles={styles}
            bookingPolicy={bookingPolicy}
          />
        );
      case 3:
        return (
          <Confirmation
            bookingDetails={bookingDetails}
            services={services}
            styles={styles}
            bookingPolicy={bookingPolicy}
            onComplete={handleBookingComplete}
          />
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className={styles.bookingPage}>
      <div className={styles.progressTracker}>
        <div
          className={`${styles.progressStep} ${step >= 1 ? styles.active : ""}`}
        >
          Select Time
        </div>
        <div
          className={`${styles.progressStep} ${step >= 2 ? styles.active : ""}`}
        >
          Details
        </div>
        <div
          className={`${styles.progressStep} ${step >= 3 ? styles.active : ""}`}
        >
          Confirm
        </div>
      </div>
      {renderStep()}
    </div>
  );
};

export default BookingPage;
