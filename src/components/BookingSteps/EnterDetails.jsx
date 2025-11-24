// src/components/BookingSteps/EnterDetails.jsx
import React, { useState } from "react";
import { PaystackButton } from "react-paystack";
import { createAppointment, createPayment } from "../../api/strapi";

const EnterDetails = ({ onNext, onBack, bookingDetails, service, styles }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const depositAmount = (service.Deposit || 10000) * 100;

  const componentProps = {
    email: formData.email,
    amount: depositAmount,
    metadata: { name: formData.fullName, phone: formData.phone },
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    text: "Make Deposit",

    onSuccess: async (transaction) => {
      const reference = transaction.reference;
      console.log("Payment successful. Reference:", reference);

      const paymentData = {
        Reference: reference,
        Amount: depositAmount / 100,
        ClientEmail: formData.email,
        PaymentStatus: "Success",
      };

      await createPayment(paymentData);
      console.log("Attempted to create payment record in Strapi.");

      // --- FIX: Use documentId instead of id for the service relation ---
      const appointmentData = {
        ClientName: formData.fullName,
        ClientEmail: formData.email,
        ClientPhone: formData.phone,
        AppointmentDateTime: bookingDetails.dateTime.toISOString(),
        BookingStatus: "Confirmed",
        service: service.documentId, // Changed from service.id to service.documentId
      };

      console.log("Creating appointment with data:", appointmentData); // Debug log

      const newAppointment = await createAppointment(appointmentData);

      if (newAppointment && !newAppointment.error) {
        console.log("Appointment created successfully:", newAppointment);
        onNext({ ...formData, paymentReference: reference });
      } else {
        console.error(
          "CRITICAL: Payment successful, but failed to create appointment.",
          newAppointment?.error
        );
        alert(
          "Your payment was successful, but we failed to save your booking. Please contact us immediately."
        );
      }
    },

    onClose: () => {
      alert("You closed the payment window without completing the deposit.");
    },
  };

  return (
    <div className={styles.stepContainer}>
      <h2>Enter Your Details</h2>
      <div className={styles.bookingSummary}>
        <h3>Booking Summary</h3>
        <p>
          <strong>Service:</strong> {service.Name}
        </p>
        <p>
          <strong>Date:</strong> {bookingDetails.dateTime?.toDateString()}
        </p>
        <p>
          <strong>Time:</strong>{" "}
          {bookingDetails.dateTime?.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>
          <strong>Duration:</strong> {service.Duration} minutes
        </p>
        <p>
          <strong>Price:</strong> ₦
          {service.OnSalesPrice
            ? service.OnSalesPrice?.toLocaleString()
            : service.Price?.toLocaleString()}
        </p>
        <p>
          <strong>Deposit Required:</strong> ₦
          {service.Deposit?.toLocaleString() || "10,000"}
        </p>
      </div>

      <form className={styles.detailsForm} onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />

        <div className={styles.buttonGroup}>
          <button className={styles.backButton} onClick={onBack} type="button">
            Back
          </button>

          <PaystackButton
            {...componentProps}
            className={styles.nextButton}
            disabled={!formData.fullName || !formData.email || !formData.phone}
          />
        </div>
      </form>
    </div>
  );
};

export default EnterDetails;
