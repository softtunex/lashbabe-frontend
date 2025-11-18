// src/pages/AcademyPage/AcademyPage.jsx (Final Version)
import React, { useState, useEffect } from "react";
import { getAcademyPageData } from "../../api/strapi";
import Loader from "../../components/Loader/Loader";
import styles from "./AcademyPage.module.css";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

const AcademyPage = () => {
  const [academyData, setAcademyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAcademyPageData();
        setAcademyData(data);
      } catch (error) {
        console.error("Failed to fetch academy data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!academyData) {
    return <div>Failed to load page content.</div>;
  }

  let heroImageUrl = "";

  // Check if HeroImage is an array and has at least one item
  if (
    Array.isArray(academyData.HeroImage) &&
    academyData.HeroImage.length > 0
  ) {
    // Access the URL from the first object in the array
    heroImageUrl = `${academyData.HeroImage[0].url}`;
  }
  // --- END OF FIX ---

  return (
    <div className={styles.academyPage}>
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className={styles.heroOverlay}>
          <h1>{academyData.Title}</h1>
          <p>{academyData.Subtitle}</p>
        </div>
      </section>

      <section className={styles.contentWrapper}>
        <div className={styles.learnSection}>
          <h2>What You'll Learn</h2>
          {academyData.WhatYouWillLearn && (
            <BlocksRenderer content={academyData.WhatYouWillLearn} />
          )}
        </div>

        <div className={styles.detailsCard}>
          <h3>Course Details</h3>
          <div className={styles.detailItem}>
            <strong>Duration:</strong>
            <span>{academyData.CourseDuration}</span>
          </div>
          <div className={styles.detailItem}>
            <strong>Price:</strong>
            <span>₦{academyData.CoursePrice?.toLocaleString()}</span>
          </div>
          <div className={styles.detailItem}>
            <strong>Includes:</strong>
            <span>{academyData.CourseIncludes}</span>
          </div>
          <a
            href={academyData.WhatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaButton}
          >
            Register Interest on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default AcademyPage;
