// src/components/BookingSteps/SelectDateTime.jsx
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getBookingSettings, getBookedSlotsForDate } from "../../api/strapi";

const SelectDateTime = ({ onNext, styles }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

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

  const generateTimeSlots = () => {
    if (!bookingSettings) return [];
    const { StartTimeHour, EndTimeHour, SlotIntervalMinutes } = bookingSettings;
    const slots = [];
    let currentTime = new Date();
    currentTime.setHours(StartTimeHour, 0, 0, 0);
    const endTime = new Date();
    endTime.setHours(EndTimeHour, 0, 0, 0);

    while (currentTime < endTime) {
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + SlotIntervalMinutes);
    }
    return slots;
  };

  // Helper to check if a specific slot is too soon (Booking Window)
  const isSlotTooSoon = (slot) => {
    if (!bookingSettings?.BookingWindowHours) return false;

    const now = new Date();
    // Calculate the earliest possible booking time allowed
    const minimumTime = new Date(
      now.getTime() + bookingSettings.BookingWindowHours * 60 * 60 * 1000
    );

    // Create a date object for the slot we are checking
    const [hours, minutes] = slot.split(":");
    const slotTime = new Date(selectedDate);
    slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If the slot is earlier than the minimum time, it is "too soon"
    return slotTime < minimumTime;
  };

  if (loading) {
    return (
      <div className={styles.stepContainer}>
        <h2>Loading Availability...</h2>
      </div>
    );
  }

  const allTimeSlots = generateTimeSlots();

  return (
    <div className={styles.stepContainer}>
      <h2>Select Date & Time</h2>

      {bookingSettings?.BookingWindowHours && (
        <p className={styles.bookingNotice}>
          Note: Bookings must be made at least{" "}
          {bookingSettings.BookingWindowHours} hours in advance.
        </p>
      )}

      <div className={styles.dateTimeContainer}>
        <div className={styles.calendarSection}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            inline
            minDate={new Date()}
            dateFormat="MMMM d, yyyy"
            calendarStartDay={0}
          />
        </div>
        <div className={styles.timeSlotsSection}>
          <h3 className={styles.timeSlotsTitle}>Available Time Slots</h3>
          <div className={styles.timeSlotsGrid}>
            {allTimeSlots.length > 0 ? (
              allTimeSlots.map((slot) => {
                // 1. Check if booked
                const isBooked = bookedSlots.includes(slot);
                // 2. Check if too soon
                const isTooSoon = isSlotTooSoon(slot);
                // 3. Determine if disabled
                const isDisabled = isBooked || isTooSoon;

                return (
                  <button
                    key={slot}
                    className={`
                      ${styles.timeSlot} 
                      ${selectedTime === slot ? styles.timeSlotSelected : ""} 
                      ${isDisabled ? styles.timeSlotDisabled : ""}
                    `}
                    onClick={() => !isDisabled && setSelectedTime(slot)}
                    type="button"
                    disabled={isDisabled}
                  >
                    {slot}
                  </button>
                );
              })
            ) : (
              <p className={styles.noSlotsMessage}>
                No time slots configured for today.
              </p>
            )}
          </div>
          {/* Simple footer message if user is confused why slots are gray */}
          <p
            style={{
              fontSize: "0.8rem",
              color: "#999",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            Disabled slots are already booked or unavailable.
          </p>
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
