import React from "react";
import styles from "../../index.module.css";
import { docPanelStyle, storyCard } from "./shared";

export default function Guide1({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHero}>
        <div className={styles.cyanKicker}>MOBILE GESTURE CORE</div>
        <h2 className={styles.cyanDocTitle}>react-app-tabs</h2>
        <p className={styles.cyanLead}>
          这个库处理手势分配。多层页面、横向切换、内部滚动容器并存时，手势会按层级和边界状态流转。
        </p>
      </div>
      <div className={styles.cyanQuote}>
        <span className={styles.cyanQuoteMark}>👋</span>
        <p className={styles.cyanQuoteText}>
          试试向左向右滑动可以切换不同层级的Tab!
        </p>
      </div>
      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>这个库解决的问题</h3>
        <div className={styles.cyanStoryGrid}>
          {storyCard(
            "嵌套滑动切换",
            "支持多层标签页的横向滑动手势，子层级滑到底才交给父层级，切换体验更自然。",
          )}
          {storyCard(
            "滚动冲突",
            "自动判断滚动边界，防止内部滚动和外部标签切换手势的冲突，确保操作顺畅。",
          )}
          {storyCard(
            "移动端优先",
            "针对移动端交互优化，手势流转逻辑简洁，兼容多种触控场景。",
          )}
        </div>
      </section>
    </div>
  );
}
