// src/components/PolicyModal/PolicyModal.jsx
import React from "react";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { MdPrivacyTip } from "react-icons/md"; // Shield icon
import styles from "./PolicyModal.module.css";

const PolicyModal = ({ policyContent, title, onClose, children }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeIcon} onClick={onClose}>
          &times;
        </button>

        <div className={styles.header}>
          <MdPrivacyTip className={styles.shieldIcon} />
          <h2>{title || "Please Review Our Policy"}</h2>
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.content}>
            {/* Render Strapi Rich Text */}
            {policyContent ? (
              <BlocksRenderer content={policyContent} />
            ) : (
              <p>Please review our booking terms and conditions.</p>
            )}
          </div>
        </div>

        <div className={styles.footer}>{children}</div>
      </div>
    </div>
  );
};

export default PolicyModal;
