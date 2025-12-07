// src/components/BookingSteps/EnterDetails.jsx

import React, { useState, useEffect } from "react";
import { usePaystackPayment } from "react-paystack"; // Using the hook for better control
import {
  createAppointment,
  createPayment,
  getAvailableStaff,
  updateAppointmentStatus, // Make sure this exists in your API file
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
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    selectedStaff: "",
  });
  const [availableStaff, setAvailableStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Processing state to prevent double clicks
  const [isProcessing, setIsProcessing] = useState(false);
  // Store the Appointment ID after we create it as "Pending"
  const [tempAppointmentId, setTempAppointmentId] = useState(null);

  // --- INITIAL LOAD ---
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

  // --- CALCULATIONS ---
  // SORT SERVICES: Main first, Add-Ons last
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
  // const totalDuration = services.reduce((sum, s) => sum + (s.Duration || 0), 0);

  // Check if form is valid
  const isFormValid = formData.fullName && formData.email && formData.phone;

  // --- PAYSTACK CONFIGURATION ---
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: formData.email,
    amount: Math.ceil(totalDeposit * 100), // Convert to Kobo (ensure integer)
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    metadata: {
      name: formData.fullName,
      phone: formData.phone,
      custom_fields: [
        {
          display_name: "Appointment ID",
          variable_name: "appointment_id",
          value: tempAppointmentId, // Will be null initially, but that's okay for config
        },
      ],
    },
  };

  // Initialize the Hook
  const initializePayment = usePaystackPayment(paystackConfig);

  // --- HANDLERS ---

  // 1. Success Handler (Runs after Payment)
  const onPaystackSuccess = async (reference) => {
    try {
      // A. Record the Payment
      await createPayment({
        Reference: reference.reference,
        Amount: totalDeposit,
        ClientEmail: formData.email,
        PaymentStatus: "Success",
        Appointment: tempAppointmentId, // Link payment to the appointment
      });

      // B. Update Appointment Status: Pending -> Confirmed
      // This is what triggers the Backend Email logic!
      const updated = await updateAppointmentStatus(
        tempAppointmentId,
        "Confirmed"
      );

      if (updated) {
        setIsProcessing(false);
        // Move to Confirmation Screen
        onNext({ ...formData, paymentReference: reference.reference });
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Finalization error:", error);
      alert(
        "Payment successful, but the system timed out confirming the booking. Please contact support with Ref: " +
          reference.reference
      );
      setIsProcessing(false);
    }
  };

  // 2. Close Handler
  const onPaystackClose = () => {
    setIsProcessing(false);
    alert("Payment cancelled. Your slot has not been reserved.");
  };

  // 3. Main Process: Create Pending Appt -> Open Paystack
  const handleBookingProcess = async () => {
    setIsProcessing(true);

    try {
      // Step A: Create Appointment as "Pending"
      const appointmentData = {
        ClientName: formData.fullName,
        ClientEmail: formData.email,
        ClientPhone: formData.phone,
        AppointmentDateTime: bookingDetails.dateTime.toISOString(),
        BookingStatus: "Pending", // <--- KEY CHANGE: Start as Pending
        TotalAmount: totalPrice,
        booked_services: services.map((s) => s.documentId),
        SelectedStaff: formData.selectedStaff || null,
      };

      const newAppointment = await createAppointment(appointmentData);

      if (!newAppointment || newAppointment.error) {
        throw new Error(newAppointment?.error || "Creation failed");
      }

      // Save ID so we can update it later
      setTempAppointmentId(newAppointment.documentId);

      // Step B: Trigger Payment Window
      // We pass the config object implicitly via the hook,
      // but we update the onSuccess/onClose callbacks here.
      initializePayment(onPaystackSuccess, onPaystackClose);
    } catch (err) {
      console.error("Initialization failed:", err);
      alert(
        "Could not initialize booking. Please check your internet connection."
      );
      setIsProcessing(false);
    }
  };

  // 4. Policy Modal Logic
  const handleProceedClick = () => {
    // If policy check is required before payment (default behavior)
    if (bookingPolicy?.ShowBeforePayment !== false) {
      setShowModal(true);
    } else {
      // If policy is shown AFTER payment (rare config), go straight to process
      handleBookingProcess();
    }
  };

  return (
    <div className={styles.stepContainer}>
      <h2>Enter Your Details</h2>

      {/* --- BOOKING SUMMARY --- */}
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
            <strong>Deposit Required:</strong> ₦{totalDeposit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* --- FORM --- */}
      <form className={styles.detailsForm} onSubmit={(e) => e.preventDefault()}>
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />
        <input
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />

        {!loadingStaff && availableStaff.length > 0 && (
          <select
            name="selectedStaff"
            value={formData.selectedStaff}
            onChange={handleInputChange}
            className={styles.staffSelect}
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

          <button
            className={styles.nextButton}
            onClick={handleProceedClick}
            disabled={!isFormValid || isProcessing}
            type="button"
          >
            {isProcessing ? "PROCESSING..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </form>

      {/* --- POLICY MODAL --- */}
      {showModal && (
        <PolicyModal
          policyContent={bookingPolicy?.PolicyContent}
          title="Please Review Our Policy"
          onClose={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            style={{
              flex: 1,
              padding: "1rem",
              border: "2px solid #1a1a1a",
              backgroundColor: "white",
              color: "#1a1a1a",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            CANCEL
          </button>

          <button
            onClick={() => {
              setShowModal(false);
              handleBookingProcess(); // Triggers the Pending -> Pay logic
            }}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "#1a1a1a",
              color: "white",
              border: "2px solid #1a1a1a",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            I AGREE & PAY
          </button>
        </PolicyModal>
      )}
    </div>
  );
};

export default EnterDetails;
