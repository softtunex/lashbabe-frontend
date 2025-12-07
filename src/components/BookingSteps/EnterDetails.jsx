// src/components/BookingSteps/EnterDetails.jsx
import React, { useState, useEffect } from "react";
import { usePaystackPayment } from "react-paystack";
import {
  createAppointment,
  createPayment,
  getAvailableStaff,
  updateAppointmentStatus,
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
  // --- STATE ---
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    selectedStaff: "",
  });
  const [availableStaff, setAvailableStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Flow Control
  const [isProcessing, setIsProcessing] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null); // Strapi ID
  const [triggerPayment, setTriggerPayment] = useState(false); // The Auto-Launcher

  // --- 1. FETCH STAFF ---
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
  const isFormValid = formData.fullName && formData.email && formData.phone;

  // --- PAYSTACK HOOK CONFIG ---
  // This config automatically updates whenever appointmentId changes
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: formData.email,
    amount: Math.ceil(totalDeposit * 100), // Kobo
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    metadata: {
      name: formData.fullName,
      phone: formData.phone,
      // CRITICAL: This sends the ID to the Webhook
      appointment_id: appointmentId,
    },
  };

  // Initialize Hook
  const initializePayment = usePaystackPayment(paystackConfig);

  // --- PAYMENT HANDLERS ---
  const onPaystackSuccess = async (reference) => {
    try {
      // 1. Record Payment (Client side)
      await createPayment({
        Reference: reference.reference,
        Amount: totalDeposit,
        ClientEmail: formData.email,
        PaymentStatus: "Success",
        Appointment: appointmentId,
      });

      // 2. Confirm Appointment (Client side - Speed)
      // Webhook acts as the safety net if this fails
      await updateAppointmentStatus(appointmentId, "Confirmed");

      setIsProcessing(false);
      onNext({ ...formData, paymentReference: reference.reference });
    } catch (error) {
      console.error("Local confirmation failed, relying on webhook:", error);
      // Proceed anyway because payment was successful
      setIsProcessing(false);
      onNext({ ...formData, paymentReference: reference.reference });
    }
  };

  const onPaystackClose = () => {
    setIsProcessing(false);
    setTriggerPayment(false);
    alert("Payment window closed. You can retry the payment.");
  };

  // --- THE LOGIC: 1-CLICK FLOW ---

  const startBookingFlow = async () => {
    setIsProcessing(true);

    try {
      // SCENARIO A: User clicked, cancelled, then clicked again.
      // We already have an ID. Don't create a duplicate. Just open Paystack.
      if (appointmentId) {
        setTriggerPayment(true);
        return;
      }

      // SCENARIO B: Fresh Booking.
      // 1. Create Pending Appointment
      const appointmentData = {
        ClientName: formData.fullName,
        ClientEmail: formData.email,
        ClientPhone: formData.phone,
        AppointmentDateTime: bookingDetails.dateTime.toISOString(),
        BookingStatus: "Pending", // Blocks slot
        TotalAmount: totalPrice,
        booked_services: services.map((s) => s.documentId),
        SelectedStaff: formData.selectedStaff || null,
      };

      const newAppointment = await createAppointment(appointmentData);

      if (!newAppointment || newAppointment.error) {
        throw new Error(newAppointment?.error || "Creation failed");
      }

      // 2. Save ID. This will cause a re-render.
      setAppointmentId(newAppointment.documentId);

      // 3. Set Trigger. The useEffect below will catch this and open Paystack.
      setTriggerPayment(true);
    } catch (err) {
      console.error(err);
      alert("Could not start booking. Please check connection.");
      setIsProcessing(false);
    }
  };

  // --- THE TRIGGER EFFECT ---
  // This watches for when we are ready to pay and the ID exists
  useEffect(() => {
    if (triggerPayment && appointmentId) {
      // Open Paystack Popup automatically
      initializePayment(onPaystackSuccess, onPaystackClose);

      // Reset trigger so it doesn't loop
      setTriggerPayment(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerPayment, appointmentId]);

  // --- UI HANDLERS ---
  const handleProceedClick = () => {
    if (bookingPolicy?.ShowBeforePayment !== false) {
      setShowModal(true);
    } else {
      startBookingFlow();
    }
  };

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
          </div>
        ))}
        <hr />
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
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isProcessing}
          required
        />
        <input
          name="phone"
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
            }}
          >
            CANCEL
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              startBookingFlow();
            }}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "#1a1a1a",
              color: "white",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
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
