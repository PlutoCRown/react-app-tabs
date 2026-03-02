import React from "react";
import styles from "../../index.module.css";
import { CodeSnippet, InlineCode, docPanelStyle } from "./shared";

export default function Guide5({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 04</div>
        <h2 className={styles.cyanDocTitle}>其他参数</h2>
      </div>

      <section className={styles.cyanSection}>
        <div className={styles.cyanPropGrid}>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>fit</div>
            <p className={styles.cyanParagraph}>
              <InlineCode>container</InlineCode> 让内容跟容器拉满，
              <InlineCode>content</InlineCode> 保持内容天然尺寸。
            </p>
          </div>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>duration</div>
            <p className={styles.cyanParagraph}>控制滑动切换过渡时间</p>
          </div>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>swtichDuration</div>
            <p className={styles.cyanParagraph}>控制点击TabBar后的切换过渡时间</p>
          </div>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>direction</div>
            <p className={styles.cyanParagraph}>
              控制 Bar 位置与排布：
              <InlineCode>top / bottom / left / right</InlineCode>。
            </p>
          </div>
        </div>

        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>参数示例</figcaption>
          <CodeSnippet
            text={`<Tabs
  fit="container"
  direction="top"
  duration={280}
  swipable
  lazyLoadDistance={2}
  ...
/>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>
    </div>
  );
}
