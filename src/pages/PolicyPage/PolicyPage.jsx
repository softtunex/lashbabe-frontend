// src/pages/PolicyPage/PolicyPage.jsx
import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { MdPrivacyTip } from "react-icons/md"; // Added back arrow
import { getBookingPolicy } from "../../api/strapi";
import Loader from "../../components/Loader/Loader";
import styles from "./PolicyPage.module.css";

const PolicyPage = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const data = await getBookingPolicy();
        setPolicy(data);
      } catch (error) {
        console.error("Error fetching policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        {/* Header Section */}
        <div className={styles.header}>
          <MdPrivacyTip className={styles.shieldIcon} />
          <h1>{policy?.Title || "Booking Policy & Terms"}</h1>
        </div>

        {/* Content Section */}
        <div className={styles.content}>
          {policy?.PolicyContent ? (
            <BlocksRenderer content={policy.PolicyContent} />
          ) : (
            <div className={styles.emptyState}>
              <p>Policy content is currently being updated.</p>
            </div>
          )}
        </div>

        {/* Footer / Contact Section */}
        <div className={styles.footer}>
          <p>
            Have questions?{" "}
            <a href="mailto:business@lashbabeng.com">Contact Us</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
