// src/pages/AboutPage/AboutPage.jsx
import React, { useState, useEffect } from "react";
import { getAboutPageData } from "../../api/strapi";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import Loader from "../../components/Loader/Loader";
import styles from "./AboutPage.module.css";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAboutPageData();
      setAboutData(data);
    };
    fetchData();
  }, []);

  if (!aboutData) {
    return <Loader />;
  }

  const imageUrl = aboutData.MainImage?.url;

  return (
    <div className={styles.aboutPage}>
      <div className={styles.contentGrid}>
        <div className={styles.textSection}>
          <h1>{aboutData.Title}</h1>
          <div className={styles.mainContent}>
            <BlocksRenderer content={aboutData.Content} />
          </div>
        </div>
        {imageUrl && (
          <div className={styles.imageSection}>
            <img src={imageUrl} alt="About LashBabe" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
