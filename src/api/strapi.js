// src/api/strapi.js
import axios from "axios";

// Create a single, reusable Axios instance for all API calls
const API = axios.create({
  baseURL: process.env.REACT_APP_STRAPI_URL,
});

/**
 * Fetches the content for the Homepage Single Type.
 * Includes Hero Title, Subtitle, and Slider Images.
 */
export const getHomepageData = async () => {
  try {
    const response = await API.get("/api/homepage?populate=*");
    // As we discovered, our data is directly at response.data.data
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return null;
  }
};

/**
 * Fetches all entries from the Service Collection Type.
 * Includes the Picture for each service.
 */
export const getServices = async () => {
  try {
    const response = await API.get("/api/services?populate=*");
    if (response.data?.data) {
      return response.data.data;
    }
    return []; // Return an empty array if no services
  } catch (error) {
    console.error("Error fetching services:", error);
    return []; // Return an empty array on error for safety
  }
};

/**
 * Fetches a single service by its unique identifier (documentId).
 * @param {string} identifier - The documentId of the service to fetch.
 */
export const getServiceById = async (identifier) => {
  try {
    const response = await API.get(`/api/services/${identifier}?populate=*`);
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error(
      `Error fetching service with identifier ${identifier}:`,
      error
    );
    return null;
  }
};

/**
 * Fetches the global settings for the booking system.
 * Includes StartTimeHour, EndTimeHour, SlotIntervalMinutes, etc.
 */
export const getBookingSettings = async () => {
  try {
    // Strapi uses the plural API ID even for single types
    const response = await API.get("/api/booking-setting");
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching booking settings:", error);
    return null;
  }
};

/**
 * Fetches an array of booked time slots (e.g., ["10:00", "14:30"]) for a specific date.
 * @param {Date} date - The date object for which to fetch booked slots.
 */
export const getBookedSlotsForDate = async (date) => {
  // Format the date to a YYYY-MM-DD string
  const dateString = date.toISOString().split("T")[0];
  try {
    const response = await API.get(
      `/api/appointments/booked-slots?date=${dateString}`
    );
    // Our custom controller returns the array directly in the data property
    if (response.data?.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching booked slots for ${dateString}:`, error);
    return [];
  }
};

/**
 * Creates a new appointment in Strapi.
 * @param {object} appointmentData - The data for the new appointment.
 */

export const createAppointment = async (appointmentData) => {
  try {
    const response = await API.post("/api/appointments", {
      data: appointmentData,
    });
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      error: error.response?.data?.error || "An unknown error occurred",
    };
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await API.post("/api/payments", { data: paymentData });
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error creating payment record:", error);
    return {
      error: error.response?.data?.error || "An unknown error occurred",
    };
  }
};

export const getAcademyPageData = async () => {
  try {
    const response = await API.get("/api/academy-page?populate=*");
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching academy page data:", error);
    return null;
  }
};

export const getGlobalData = async () => {
  try {
    const response = await API.get("/api/global?populate=*"); // Use the plural API ID
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching global data:", error);
    return null;
  }
};

// Add to src/api/strapi.js
export const getAboutPageData = async () => {
  try {
    const response = await API.get("/api/about-page?populate=*");
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching about page data:", error);
    return null;
  }
};

// Add this to src/api/strapi.js
export const getActivePromotions = async () => {
  try {
    // Filter to get only promotions where IsActive is true
    const response = await API.get(
      "/api/promotions?filters[IsActive][$eq]=true&populate=*"
    );
    if (response.data?.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    return [];
  }
};

// Add to src/api/strapi.js

/**
 * Fetches available staff from booking settings
 */
export const getAvailableStaff = async () => {
  try {
    // FIX: Changed 'AvailableStaff' to 'available_staffs' to match your Strapi Schema
    const response = await API.get(
      "/api/booking-setting?populate[available_staffs][filters][IsAvailable][$eq]=true"
    );

    // Check if the data exists under the corrected key
    if (response.data?.data?.available_staffs) {
      return response.data.data.available_staffs;
    }
    return [];
  } catch (error) {
    console.error("Error fetching available staff:", error);
    return [];
  }
};

/**
 * Fetches booking policy
 */
export const getBookingPolicy = async () => {
  try {
    const response = await API.get("/api/booking-policy?populate=*");
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching booking policy:", error);
    return null;
  }
};
