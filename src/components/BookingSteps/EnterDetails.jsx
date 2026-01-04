// src/components/BookingSteps/EnterDetails.jsx
import React, { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import {
  createAppointment,
  createPayment,
  getAvailableStaff,
} from "../../api/strapi";
import PolicyModal from "../PolicyModal/PolicyModal";

const EnterDetails = ({
  onNext,
  onBack,
  bookingDetails,
  services,
  styles,
  bookingPolicy,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    selectedStaff: "",
  });
  const [availableStaff, setAvailableStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // NEW: Store the created appointment ID
  const [appointmentId, setAppointmentId] = useState(null);
  const [showPaystackButton, setShowPaystackButton] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      const staff = await getAvailableStaff();
      setAvailableStaff(staff);
      setLoadingStaff(false);
    };
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // SORT SERVICES
  const sortedServices = [...services].sort((a, b) => {
    if (a.IsAddOn && !b.IsAddOn) return 1;
    if (!a.IsAddOn && b.IsAddOn) return -1;
    return 0;
  });

  const totalDeposit = services.reduce((sum, s) => sum + (s.Deposit || 0), 0);
  const totalPrice = services.reduce(
    (sum, s) => sum + (s.OnSalesPrice || s.Price || 0),
    0
  );
  const totalDuration = services.reduce((sum, s) => sum + (s.Duration || 0), 0);
  const depositAmount = totalDeposit * 100; // Paystack takes kobo

  const shouldShowPolicyBefore = bookingPolicy?.ShowBeforePayment ?? true;
  const isFormValid = formData.fullName && formData.email && formData.phone;

  // NEW: Create appointment BEFORE payment (only once)
  const handleCreateAppointment = async () => {
    if (appointmentId) {
      return appointmentId; // Already created
    }

    setIsProcessing(true);

    try {
      const appointmentData = {
        ClientName: formData.fullName,
        ClientEmail: formData.email,
        ClientPhone: formData.phone,
        AppointmentDateTime: bookingDetails.dateTime.toISOString(),
        BookingStatus: "Pending", // Will be updated to "Confirmed" by webhook
        TotalAmount: totalPrice,
        booked_services: services.map((s) => s.documentId),
        SelectedStaff: formData.selectedStaff || null,
      };

      const newAppointment = await createAppointment(appointmentData);

      if (newAppointment && !newAppointment.error) {
        setAppointmentId(newAppointment.documentId);
        console.log("Appointment created:", newAppointment.documentId);
        setIsProcessing(false);
        return newAppointment.documentId;
      } else {
        console.error("Appointment creation failed:", newAppointment?.error);
        alert("Failed to create appointment. Please try again.");
        setIsProcessing(false);
        return null;
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
      return null;
    }
  };

  // UPDATED: Simplified success handler
  const handleSuccess = async (transaction) => {
    setIsProcessing(true);
    const reference = transaction.reference;

    try {
      // Record the payment
      await createPayment({
        Reference: reference,
        Amount: totalDeposit,
        ClientEmail: formData.email,
        PaymentStatus: "Success",
        Appointment: appointmentId,
      });

      console.log("Payment recorded successfully");
      onNext({ ...formData, paymentReference: reference });
    } catch (error) {
      console.error("Payment record error:", error);
      // Even if this fails, webhook should handle it
      onNext({ ...formData, paymentReference: reference });
    } finally {
      setIsProcessing(false);
    }
  };

  // UPDATED: Paystack props with appointment_id
  const paystackProps = {
    email: formData.email,
    amount: depositAmount,
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    metadata: {
      name: formData.fullName,
      phone: formData.phone,
      appointment_id: appointmentId, // CRITICAL: This is what webhook needs!
    },
    onSuccess: handleSuccess,
    onClose: () => {
      setIsProcessing(false);
      console.log("Payment window closed");
    },
  };

  // Handler for button clicks (creates appointment then shows Paystack button)
  const handlePaymentClick = async () => {
    const id = await handleCreateAppointment();
    if (id) {
      // Appointment created successfully, now show the Paystack button which will auto-trigger
      setShowPaystackButton(true);
    }
  };

  // Handler for modal policy button
  const handlePolicyClick = async () => {
    const id = await handleCreateAppointment();
    if (id) {
      setShowModal(true);
    }
  };

  // Auto-trigger Paystack when button becomes visible
  useEffect(() => {
    if (showPaystackButton && appointmentId) {
      // Use a small delay to ensure button is rendered
      const timer = setTimeout(() => {
        const paystackBtn = document.querySelector(".paystack-auto-trigger");
        if (paystackBtn) {
          paystackBtn.click();
          setShowPaystackButton(false); // Reset for next time
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showPaystackButton, appointmentId]);

  return (
    <div className={styles.stepContainer}>
      <h2>Enter Your Details</h2>

      <div className={styles.bookingSummary}>
        <h3>Booking Summary</h3>
        {sortedServices.map((service, index) => (
          <div key={service.documentId || index} className={styles.serviceItem}>
            <p>
              <strong>
                {index + 1}. {service.Name}
              </strong>
              {service.IsAddOn && (
                <span className={styles.addOnBadge}>Add-On</span>
              )}
            </p>
            <p className={styles.serviceDuration}>{service.Duration} minutes</p>
          </div>
        ))}
        <hr />
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
          <strong>Total Duration:</strong> {totalDuration} minutes
        </p>
        <p>
          <strong>Total Price:</strong> ₦{totalPrice.toLocaleString()}
        </p>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        >
          <p style={{ margin: 0, fontSize: "1.1rem" }}>
            <strong>Total Deposit Required:</strong> ₦
            {totalDeposit.toLocaleString()}
          </p>
        </div>
      </div>

      <form className={styles.detailsForm} onSubmit={(e) => e.preventDefault()}>
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={isProcessing}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isProcessing}
          required
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          disabled={isProcessing}
          required
        />

        {!loadingStaff && availableStaff.length > 0 && (
          <select
            name="selectedStaff"
            value={formData.selectedStaff}
            onChange={handleInputChange}
            className={styles.staffSelect}
            disabled={isProcessing}
          >
            <option value="">Select Technician (Optional)</option>
            {availableStaff.map((staff) => (
              <option key={staff.id} value={staff.documentId}>
                {staff.Name}
              </option>
            ))}
          </select>
        )}

        <div className={styles.buttonGroup}>
          <button
            className={styles.backButton}
            onClick={onBack}
            type="button"
            disabled={isProcessing}
          >
            BACK
          </button>

          {shouldShowPolicyBefore ? (
            <button
              className={styles.nextButton}
              onClick={handlePolicyClick}
              disabled={!isFormValid || isProcessing}
              type="button"
            >
              {isProcessing ? "PROCESSING..." : "REVIEW POLICY & DEPOSIT"}
            </button>
          ) : (
            <>
              {showPaystackButton && appointmentId ? (
                // Auto-triggered PaystackButton (hidden, just to trigger payment)
                <div style={{ display: "none" }}>
                  <PaystackButton
                    {...paystackProps}
                    text="MAKE DEPOSIT"
                    className="paystack-auto-trigger"
                  />
                </div>
              ) : null}
              {/* Always show this button - it creates appointment and triggers Paystack */}
              <button
                className={styles.nextButton}
                onClick={handlePaymentClick}
                disabled={!isFormValid || isProcessing}
                type="button"
              >
                {isProcessing ? "PROCESSING..." : "MAKE DEPOSIT"}
              </button>
            </>
          )}
        </div>
      </form>

      {showModal && (
        <PolicyModal
          policyContent={bookingPolicy?.PolicyContent}
          title="Please Review Our Policy"
          onClose={() => {
            setShowModal(false);
            setIsProcessing(false);
          }}
        >
          <button
            onClick={() => {
              setShowModal(false);
              setIsProcessing(false);
            }}
            style={{
              flex: 1,
              padding: "1rem",
              border: "2px solid #1a1a1a",
              backgroundColor: "white",
              color: "#1a1a1a",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <div style={{ flex: 1 }}>
            <PaystackButton
              {...paystackProps}
              text="I AGREE & DEPOSIT"
              className="paystack-modal-btn"
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: "#1a1a1a",
                color: "white",
                border: "2px solid #1a1a1a",
                borderRadius: "6px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            />
          </div>
        </PolicyModal>
      )}
    </div>
  );
};

export default EnterDetails;
