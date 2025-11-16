// src/api/strapi.js
import axios from "axios";

const strapi = axios.create({
  baseURL: process.env.REACT_APP_STRAPI_URL,
});

// Function to fetch data for the homepage
export const getHomepageData = async () => {
  try {
    // The real API call. `populate=*` tells Strapi to include our images.
    const response = await strapi.get("/api/homepage?populate=*");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return null;
  }
};

// Function to fetch all services
export const getServices = async () => {
  try {
    // We use populate=* to make sure we get the image for each service
    const response = await strapi.get("/api/services?populate=*");

    // As we discovered, our data is directly in response.data.data
    if (response.data?.data) {
      return response.data.data;
    }
    return []; // Return an empty array if no data
  } catch (error) {
    console.error("Error fetching services:", error);
    return []; // Return an empty array on error
  }
};

// Function to fetch a single service by ID
export const getServiceById = async (id) => {
  try {
    // Try using documentId first (Strapi v5 format)
    const response = await strapi.get(`/api/services/${id}?populate=*`);

    // Log the response for debugging
    console.log("Service by ID response:", response.data);

    // Strapi v5 returns data in response.data.data
    if (response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    // If 404, it might be a documentId vs id issue
    if (error.response?.status === 404) {
      console.error(
        "Service not found. Check if you're using the correct ID format (numeric ID vs documentId)"
      );
    }

    return null;
  }
};
