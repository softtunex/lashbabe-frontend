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

  // 1. Fetch the main booking settings once on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const settings = await getBookingSettings();
      setBookingSettings(settings);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // 2. Fetch the booked slots whenever the selectedDate changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      const booked = await getBookedSlotsForDate(selectedDate);
      setBookedSlots(booked);
      setSelectedTime(null); // Reset time selection when date changes
    };
    fetchBookedSlots();
  }, [selectedDate]);

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":");
      const dateTime = new Date(selectedDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onNext({ dateTime });
    } else {
      alert("Please select both a date and an available time.");
    }
  };

  // Generate time slots based on booking settings
  const generateTimeSlots = () => {
    if (!bookingSettings) return [];

    const { StartTimeHour, EndTimeHour, SlotIntervalMinutes } = bookingSettings;
    const slots = [];

    // Create a date object to manipulate time
    let currentTime = new Date();
    currentTime.setHours(StartTimeHour, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(EndTimeHour, 0, 0, 0);

    while (currentTime < endTime) {
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);

      // Increment time by the interval
      currentTime.setMinutes(currentTime.getMinutes() + SlotIntervalMinutes);
    }

    return slots;
  };

  // Filter out slots that are within the booking window (minimum advance notice)
  const filterSlotsByBookingWindow = (slots) => {
    if (!bookingSettings?.BookingWindowHours) return slots;

    const now = new Date();
    const minimumBookingTime = new Date(
      now.getTime() + bookingSettings.BookingWindowHours * 60 * 60 * 1000
    );

    return slots.filter((slot) => {
      // Create a Date object for this slot
      const [hours, minutes] = slot.split(":");
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Only include slots that are after the minimum booking window
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

  // Generate all potential time slots
  const allTimeSlots = generateTimeSlots();

  // Filter out booked slots
  const unbookedSlots = allTimeSlots.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  // Filter out slots within the booking window (too soon to book)
  const availableTimeSlots = filterSlotsByBookingWindow(unbookedSlots);

  // Calculate minimum date (today)
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
