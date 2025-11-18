// src/pages/BookingPage/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./BookingPage.module.css";
import { getServiceById } from "../../api/strapi";
import Loader from "../../components/Loader/Loader";

// Import our new, separated step components
import SelectDateTime from "../../components/BookingSteps/SelectDateTime";
import EnterDetails from "../../components/BookingSteps/EnterDetails";
import Confirmation from "../../components/BookingSteps/Confirmation";

const BookingPage = () => {
  const { serviceId } = useParams();
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      const serviceData = await getServiceById(serviceId);
      setService(serviceData);
      setLoading(false);
    };
    fetchService();
  }, [serviceId]);

  const handleNextStep = (data) => {
    setBookingDetails({ ...bookingDetails, ...data });
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  if (loading) return <Loader />;
  if (!service) return <div>Service not found.</div>;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SelectDateTime onNext={handleNextStep} styles={styles} />;
      case 2:
        return (
          <EnterDetails
            onNext={handleNextStep}
            onBack={handlePrevStep}
            bookingDetails={bookingDetails}
            service={service}
            styles={styles}
          />
        );
      case 3:
        return (
          <Confirmation
            bookingDetails={bookingDetails}
            service={service}
            styles={styles}
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
