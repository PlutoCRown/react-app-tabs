import React from "react";
import styles from "../../index.module.css";
import { CodeSnippet, InlineCode, docPanelStyle, storyCard } from "./shared";

export default function Guide4({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 03</div>
        <h2 className={styles.cyanDocTitle}>TabInnerScroll</h2>
        <p className={styles.cyanLeadMini}>
          用法接近 <InlineCode>div</InlineCode>，同时处理滚动边界和手势交接。
        </p>
        <p className={styles.cyanTip}>
          ⬆ 试试手动拖动上面TabBar 滚动，他没滚到头不会触发Panel滚动。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <p className={styles.cyanParagraph}>
          把横向或纵向滚动区域包进来即可，不需要改业务结构。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>
            把滚动容器替换成 TabInnerScroll
          </figcaption>
          <CodeSnippet
            text={`<TabInnerScroll direction="horizontal" className={styles.barScroller}>
  {items.map((item) => (
    <button key={item.key} onClick={item.onClick}>
      {item.tab.title}
    </button>
  ))}
</TabInnerScroll>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>参数说明</h3>
        <div className={styles.cyanStoryGrid}>
          {storyCard("as", "默认是 div ,可以改变 DOM 元素")}
          {storyCard(
            "stopPropagation",
            "默认为false, true: 永远不允许在此组件内滑动到外部面板",
          )}
          {storyCard("其他参数", "与 div 相同 ")}
        </div>
      </section>
      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>冲突处理流程</h3>
        <div className={styles.cyanStoryGrid}>
          {storyCard("还能滚", "先交给内部容器。")}
          {storyCard("到边界", "再把控制权交给外层 Tabs。")}
          {storyCard("连续手势", "滚动和切页在一次动作里连上。")}
        </div>
      </section>
    </div>
  );
}
