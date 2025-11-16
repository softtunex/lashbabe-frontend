// src/pages/BookingPage/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import calendar CSS
import styles from "./BookingPage.module.css";
import { getServiceById } from "../../api/strapi";
import Loader from "../../components/Loader/Loader";

// --- We will create the step components inside this file for simplicity ---

const SelectDateTime = ({ onNext }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(null);

  // Dummy available times for demonstration
  const availableTimes = ["10:00", "12:00", "15:00"];

  const handleNext = () => {
    if (date && time) {
      onNext({ date, time });
    } else {
      alert("Please select a date and time.");
    }
  };

  return (
    <div className={styles.stepContainer}>
      <h2>1. Select Date & Time</h2>
      <Calendar onChange={setDate} value={date} minDate={new Date()} />
      <div className={styles.timeSlots}>
        {availableTimes.map((slot) => (
          <button
            key={slot}
            className={`${styles.timeSlot} ${time === slot ? styles.selected : ""}`}
            onClick={() => setTime(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
      <button className={styles.nextButton} onClick={handleNext}>
        Next
      </button>
    </div>
  );
};

const EnterDetails = ({ onNext, onBack, bookingDetails, service }) => {
  return (
    <div className={styles.stepContainer}>
      <h2>2. Enter Your Details</h2>
      <div className={styles.bookingSummary}>
        <h3>Booking Summary</h3>
        <p>
          <strong>Service:</strong> {service.Name}
        </p>
        <p>
          <strong>Date:</strong> {bookingDetails.date.toDateString()}
        </p>
        <p>
          <strong>Time:</strong> {bookingDetails.time}
        </p>
        <p>
          <strong>Deposit Due:</strong> ₦
          {service.Deposit?.toLocaleString() || "10,000"}
        </p>
      </div>
      <form className={styles.detailsForm}>
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="Email Address" required />
        <input type="tel" placeholder="Phone Number" required />
      </form>
      <div className={styles.buttonGroup}>
        <button className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <button className={styles.nextButton} onClick={onNext}>
          Proceed to Paystack
        </button>
      </div>
    </div>
  );
};

const Confirmation = ({ bookingDetails }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.confirmation}>
        <span className={styles.checkMark}>✓</span>
        <h2>You're Booked!</h2>
        <p>
          Thank you, {bookingDetails.name || "Ada"}. A confirmation email has
          been sent.
        </p>
        <button className={styles.nextButton}>Add to Google Calendar</button>
      </div>
    </div>
  );
};

// --- Main BookingPage Component ---

const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        console.log("Fetching service with ID:", serviceId);
        const serviceData = await getServiceById(serviceId);

        console.log("Service data received:", serviceData);

        if (serviceData) {
          setService(serviceData);
          setError(null);
        } else {
          setError("Service not found");
        }
      } catch (err) {
        console.error("Error in fetchService:", err);
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    } else {
      setError("No service ID provided");
      setLoading(false);
    }
  }, [serviceId]);

  const handleNextStep = (data) => {
    setBookingDetails({ ...bookingDetails, ...data });
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  if (loading) return <Loader />;

  if (error || !service) {
    return (
      <div className={styles.errorContainer}>
        <h2>Oops! Something went wrong</h2>
        <p>{error || "Service not found"}</p>
        <p>Service ID: {serviceId}</p>
        <button
          className={styles.nextButton}
          onClick={() => navigate("/services")}
        >
          Back to Services
        </button>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SelectDateTime onNext={handleNextStep} />;
      case 2:
        return (
          <EnterDetails
            onNext={handleNextStep}
            onBack={handlePrevStep}
            bookingDetails={bookingDetails}
            service={service}
          />
        );
      case 3:
        return <Confirmation bookingDetails={bookingDetails} />;
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
