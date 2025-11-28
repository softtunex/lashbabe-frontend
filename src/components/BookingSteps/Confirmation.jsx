// src/components/BookingSteps/Confirmation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PolicyModal from "../PolicyModal/PolicyModal";

const Confirmation = ({
  bookingDetails,
  services,
  styles,
  onComplete,
  bookingPolicy,
}) => {
  const navigate = useNavigate();
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    // LOGIC: If 'ShowBeforePayment' is explicitly FALSE,
    // it means the user has already paid (deposit made) but hasn't seen the policy yet.
    // So we show it now.
    if (bookingPolicy && bookingPolicy.ShowBeforePayment === false) {
      setShowPolicy(true);
    }
  }, [bookingPolicy]);

  const handleGoHome = () => {
    if (onComplete) onComplete();
    navigate("/");
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.confirmation}>
        <span className={styles.checkMark}>✓</span>
        <h2>Booking Confirmed!</h2>
        <p>
          Thank you, {bookingDetails.fullName}. Your deposit has been received.
        </p>

        <div className={styles.confirmationButtons}>
          <button className={styles.secondaryButton} onClick={handleGoHome}>
            BACK TO HOME
          </button>
        </div>
      </div>

      {/* Auto-open Modal for "After Payment" flow */}
      {showPolicy && (
        <PolicyModal
          policyContent={bookingPolicy?.PolicyContent}
          title="Important Booking Information"
          onClose={() => setShowPolicy(false)}
        >
          <button
            onClick={() => setShowPolicy(false)}
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: "#1a1a1a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            I HAVE READ AND UNDERSTOOD
          </button>
        </PolicyModal>
      )}
    </div>
  );
};

export default Confirmation;
