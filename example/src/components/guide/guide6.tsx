import React from "react";
import styles from "../../index.module.css";
import { docPanelStyle } from "./shared";

export default function Guide6({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHero}>
        <div className={styles.cyanKicker}>FINAL</div>
        <h2 className={styles.cyanDocTitle}>继续滑动做验收</h2>
        <p className={styles.cyanLead}>
          再向左或向右滑动几次，重点看嵌套层和边界位置的交接是否连贯。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>回到 GitHub</h3>
        <p className={styles.cyanParagraph}>
          项目主页：
          <a
            className={styles.cyanAnchor}
            href="https://github.com/plutocrown/react-app-tabs"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/plutocrown/react-app-tabs
          </a>
        </p>
      </section>

      <p className={styles.cyanFooter}>继续左右滑动，体验跨层 Tab 的接管与交接。</p>
    </div>
  );
}
