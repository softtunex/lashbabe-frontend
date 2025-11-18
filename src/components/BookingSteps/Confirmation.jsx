// src/components/BookingSteps/Confirmation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGlobalData } from "../../api/strapi";

const Confirmation = ({ bookingDetails, service, styles }) => {
  const navigate = useNavigate();
  const [globalData, setGlobalData] = useState(null);

  useEffect(() => {
    // Fetch global data to get the business address for the calendar event
    const fetchData = async () => {
      const data = await getGlobalData();
      setGlobalData(data);
    };
    fetchData();
  }, []);

  const handleGoHome = () => {
    navigate("/"); // Navigate to the homepage
  };

  // Helper function to format dates for Google Calendar URL
  const formatGoogleCalendarDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, "");
  };

  const generateGoogleCalendarLink = () => {
    if (!bookingDetails.dateTime || !service || !globalData) {
      return "#"; // Return a placeholder if data isn't ready
    }

    // Calculate the end time of the appointment
    const startTime = bookingDetails.dateTime;
    const endTime = new Date(startTime.getTime() + service.Duration * 60000); // Duration is in minutes

    const eventDetails = {
      title: `Lash Appointment: ${service.Name}`,
      startDate: formatGoogleCalendarDate(startTime),
      endDate: formatGoogleCalendarDate(endTime),
      details: `Your appointment for ${service.Name} with LashBabe_ng.`,
      location: globalData.Address,
    };

    const calendarUrl = new URL("https://www.google.com/calendar/render");
    calendarUrl.searchParams.set("action", "TEMPLATE");
    calendarUrl.searchParams.set("text", eventDetails.title);
    calendarUrl.searchParams.set(
      "dates",
      `${eventDetails.startDate}/${eventDetails.endDate}`
    );
    calendarUrl.searchParams.set("details", eventDetails.details);
    calendarUrl.searchParams.set("location", eventDetails.location);

    return calendarUrl.toString();
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.confirmation}>
        <span className={styles.checkMark}>✔</span>
        <h2>You're Booked!</h2>
        <p>
          Thank you, {bookingDetails.fullName || "valued client"}. A
          confirmation email has been sent.
        </p>

        {/* --- NEW BUTTONS --- */}
        <div className={styles.confirmationButtons}>
          <a
            href={generateGoogleCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.nextButton} // Reusing the primary button style
          >
            Add to Google Calendar
          </a>
          <button
            className={styles.secondaryButton} // Using a new secondary style
            onClick={handleGoHome}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
