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

  // SORT SERVICES: Main first, Add-Ons last
  const sortedServices = [...services].sort((a, b) => {
    if (a.IsAddOn && !b.IsAddOn) return 1;
    if (!a.IsAddOn && b.IsAddOn) return -1;
    return 0;
  });

  // --- Calculations ---
  const totalDeposit = services.reduce((sum, s) => sum + s.Deposit, 0);
  const totalPrice = services.reduce(
    (sum, s) => sum + (s.OnSalesPrice || s.Price || 0),
    0
  );
  const totalDuration = services.reduce((sum, s) => sum + (s.Duration || 0), 0);
  const depositAmount = totalDeposit * 100; // Paystack takes kobo

  // --- Logic Configuration ---
  // If ShowBeforePayment is null/undefined, default to TRUE. Only skip if explicitly false.
  const shouldShowPolicyBefore = bookingPolicy?.ShowBeforePayment ?? true;
  const isFormValid = formData.fullName && formData.email && formData.phone;

  // --- Paystack Handlers ---
  const handleSuccess = async (transaction) => {
    const reference = transaction.reference;

    // 1. Record Payment
    await createPayment({
      Reference: reference,
      Amount: totalDeposit,
      ClientEmail: formData.email,
      PaymentStatus: "Success",
    });

    // 2. Create Appointment
    const appointmentData = {
      ClientName: formData.fullName,
      ClientEmail: formData.email,
      ClientPhone: formData.phone,
      AppointmentDateTime: bookingDetails.dateTime.toISOString(),
      BookingStatus: "Confirmed",
      TotalAmount: totalPrice,
      booked_services: services.map((s) => s.documentId),
      SelectedStaff: formData.selectedStaff || null,
    };

    const newAppointment = await createAppointment(appointmentData);

    if (newAppointment && !newAppointment.error) {
      onNext({ ...formData, paymentReference: reference });
    } else {
      alert(
        "Payment successful but booking failed. Please screenshot this and contact support."
      );
    }
  };

  const paystackProps = {
    email: formData.email,
    amount: depositAmount,
    metadata: { name: formData.fullName, phone: formData.phone },
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    onSuccess: handleSuccess,
    onClose: () => alert("Payment window closed"),
  };

  return (
    <div className={styles.stepContainer}>
      <h2>Enter Your Details</h2>

      <div className={styles.bookingSummary}>
        <h3>Booking Summary</h3>

        {/* Use sortedServices here */}
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

        {/* Appointment Details */}
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

        {/* Deposit Highlight */}
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
      {/* --- END SUMMARY --- */}

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
          <button className={styles.backButton} onClick={onBack} type="button">
            BACK
          </button>

          {/* Conditional Button Rendering */}
          {shouldShowPolicyBefore ? (
            // Policy BEFORE Payment -> Open Modal
            <button
              className={styles.nextButton}
              onClick={() => setShowModal(true)}
              disabled={!isFormValid}
              type="button"
            >
              REVIEW POLICY & DEPOSIT
            </button>
          ) : (
            // Policy AFTER Payment -> Direct Paystack
            <PaystackButton
              {...paystackProps}
              text="MAKE DEPOSIT"
              className={styles.nextButton}
              disabled={!isFormValid}
            />
          )}
        </div>
      </form>

      {/* Policy Modal */}
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
                textTransform: "uppercase",
                fontSize: "0.9rem",
              }}
            />
          </div>
        </PolicyModal>
      )}
    </div>
  );
};

export default EnterDetails;
