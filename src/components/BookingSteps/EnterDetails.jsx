// src/components/BookingSteps/EnterDetails.jsx (Relationship Temporarily Removed)
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

  // Prevent the form from causing a page refresh
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const depositAmount = (service.Deposit || 10000) * 100; // in kobo

  // Props for the Paystack button component
  const componentProps = {
    email: formData.email,
    amount: depositAmount,
    metadata: { name: formData.fullName, phone: formData.phone },
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    text: "Make Deposit",

    onSuccess: async (transaction) => {
      const reference = transaction.reference;
      console.log("Payment successful. Reference:", reference);

      // --- 1. CREATE PAYMENT RECORD (We still want to track this) ---
      const paymentData = {
        Reference: reference,
        Amount: depositAmount / 100, // Store amount in Naira
        ClientEmail: formData.email,
        PaymentStatus: "Success",
      };

      // We will create the payment record but won't stop the flow if it fails.
      // The appointment creation is the most critical part for the user.
      await createPayment(paymentData);
      console.log("Attempted to create payment record in Strapi.");

      // --- 2. CREATE THE APPOINTMENT (without the payment link) ---
      const appointmentData = {
        ClientName: formData.fullName,
        ClientEmail: formData.email,
        ClientPhone: formData.phone,
        AppointmentDateTime: bookingDetails.dateTime.toISOString(),
        BookingStatus: "Confirmed",
        service: service.id,
        // The problematic "payment" key has been removed for now.
      };

      const newAppointment = await createAppointment(appointmentData);

      if (newAppointment && !newAppointment.error) {
        console.log("Appointment created successfully:", newAppointment);

        // --- 3. PROCEED TO THE CONFIRMATION PAGE ---
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
