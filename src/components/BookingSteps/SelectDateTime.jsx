// src/components/BookingSteps/SelectDateTime.jsx
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getBookingSettings, getBookedSlotsForDate } from "../../api/strapi";

const SelectDateTime = ({ onNext, styles }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // State for our dynamic data
  const [bookingSettings, setBookingSettings] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const settings = await getBookingSettings();
      setBookingSettings(settings);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      const booked = await getBookedSlotsForDate(selectedDate);
      setBookedSlots(booked);
      setSelectedTime(null);
    };
    fetchBookedSlots();
  }, [selectedDate]);

  // --- THE FIX IS HERE ---
  const handleNext = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":");

      // 1. Get the Year, Month, Day from the selected date picker
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      // 2. Nigeria is UTC+1.
      // To save the correct time in the DB (which expects UTC),
      // we must SUBTRACT 1 hour from the selected time.
      // Example: User picks 09:00. We want DB to save 08:00 UTC.
      // 9 - 1 = 8.
      const NIGERIA_OFFSET = 1;
      const utcHour = parseInt(hours) - NIGERIA_OFFSET;

      // 3. Create a UTC Date object
      // We use Date.UTC to explicitly set the components
      const utcDate = new Date(
        Date.UTC(year, month, day, utcHour, parseInt(minutes), 0)
      );

      // 4. Pass this corrected UTC date to the next step
      // When .toISOString() is called later, it will be the correct UTC time.
      onNext({ dateTime: utcDate });
    } else {
      alert("Please select both a date and an available time.");
    }
  };

  // Generate time slots based on booking settings
  const generateTimeSlots = () => {
    if (!bookingSettings) return [];

    const { StartTimeHour, EndTimeHour, SlotIntervalMinutes } = bookingSettings;
    const slots = [];

    // Simple number manipulation to generate strings "09:00", "09:30"
    // We don't use Date objects here to avoid timezone confusion during generation
    let currentHour = StartTimeHour;
    let currentMinute = 0;

    while (currentHour < EndTimeHour) {
      const hStr = currentHour.toString().padStart(2, "0");
      const mStr = currentMinute.toString().padStart(2, "0");
      slots.push(`${hStr}:${mStr}`);

      currentMinute += SlotIntervalMinutes;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    return slots;
  };

  // Filter out slots that are within the booking window (minimum advance notice)
  const filterSlotsByBookingWindow = (slots) => {
    if (!bookingSettings?.BookingWindowHours) return slots;

    // Get Current Time in Nigeria (UTC+1) to make calculation fair
    const now = new Date();
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
    const nigeriaNow = new Date(utcNow + 3600000 * 1); // Add 1 hour for Nigeria

    const minimumBookingTime = new Date(
      nigeriaNow.getTime() + bookingSettings.BookingWindowHours * 60 * 60 * 1000
    );

    return slots.filter((slot) => {
      const [hours, minutes] = slot.split(":");

      // Compare against the selected date
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Simple comparison
      return slotDateTime >= minimumBookingTime;
    });
  };

  if (loading) {
    return (
      <div className={styles.stepContainer}>
        <h2>Loading Availability...</h2>
      </div>
    );
  }

  const allTimeSlots = generateTimeSlots();

  // Filter out booked slots
  // Assuming getBookedSlotsForDate returns strings like "09:00" representing Nigeria time
  const unbookedSlots = allTimeSlots.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  const availableTimeSlots = filterSlotsByBookingWindow(unbookedSlots);
  const minDate = new Date();

  return (
    <div className={styles.stepContainer}>
      <h2>Select Date & Time</h2>

      {bookingSettings?.BookingWindowHours && (
        <p className={styles.bookingNotice}>
          Appointments must be booked at least{" "}
          {bookingSettings.BookingWindowHours} hours in advance
        </p>
      )}

      <div className={styles.dateTimeContainer}>
        <div className={styles.calendarSection}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            inline
            minDate={minDate}
            dateFormat="MMMM d, yyyy"
            calendarStartDay={0}
          />
        </div>
        <div className={styles.timeSlotsSection}>
          <h3 className={styles.timeSlotsTitle}>Available Time Slots</h3>
          <div className={styles.timeSlotsGrid}>
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((slot) => (
                <button
                  key={slot}
                  className={`${styles.timeSlot} ${selectedTime === slot ? styles.timeSlotSelected : ""}`}
                  onClick={() => setSelectedTime(slot)}
                  type="button"
                >
                  {slot}
                </button>
              ))
            ) : (
              <p className={styles.noSlotsMessage}>
                {unbookedSlots.length === 0
                  ? "No available slots for this day."
                  : `All slots are within the ${bookingSettings.BookingWindowHours}-hour booking window. Please select a later date or time.`}
              </p>
            )}
          </div>
        </div>
      </div>
      <button
        className={styles.nextButton}
        onClick={handleNext}
        disabled={!selectedTime}
        type="button"
      >
        Continue
      </button>
    </div>
  );
};

export default SelectDateTime;
