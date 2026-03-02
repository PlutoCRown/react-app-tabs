import React from "react";
import styles from "../index.module.css";

export function gradientPanel(color: string, label: string) {
  return (
    <div
      className={styles.gradientPanel}
      style={{
        background: `radial-gradient(circle at 50% 30%, ${color}, transparent 72%)`,
      }}
    >
      <div className={styles.gradientLabel}>{label}</div>
    </div>
  );
}
