// src/components/BookingSteps/Confirmation.jsx
import React from "react";

const Confirmation = ({ bookingDetails, styles }) => {
  // The bookingDetails object now contains fullName, email, phone etc.
  return (
    <div className={styles.stepContainer}>
      <div className={styles.confirmation}>
        <span className={styles.checkMark}>✔</span>
        <h2>You're Booked!</h2>
        <p>
          {/* Use the actual name passed in bookingDetails */}
          Thank you, {bookingDetails.fullName || "valued client"}. A
          confirmation email has been sent.
        </p>
        <button className={styles.nextButton}>Add to Google Calendar</button>
      </div>
    </div>
  );
};

export default Confirmation;
