import React from "react";
import styles from "../../index.module.css";
import { CodeSnippet, InlineCode, docPanelStyle } from "./shared";

export default function Guide3({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 02</div>
        <h2 className={styles.cyanDocTitle}>完全自定义 TabBar</h2>
        <p className={styles.cyanLeadMini}>
          需要复合头部时，使用 <InlineCode>TabBarRenderer</InlineCode>。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <p className={styles.cyanParagraph}>
          这里可以控制整条 Bar：标题、角标、右侧操作区、分层动画都能加入。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>
            带 extra 区域的结构
          </figcaption>
          <CodeSnippet
            text={`<Tabs
  tabs={tabs}
  keyExtractor={(tab) => tab.id}
  TabBarRenderer={(meta) => (
    <div className={styles.customBar}>
      <div className={styles.items}>{/* 滚动标签区 */}</div>
      <div className={styles.extra}>Release Notes</div>
    </div>
  )}
  TabPanelRenderer={(tab) => <Panel tab={tab} />}
/>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>0 刷新动画更新</h3>
        <p className={styles.cyanParagraph}>
          <InlineCode>meta.callback.onSwipe</InlineCode>
          {" / "}
          <InlineCode>onChange</InlineCode>
          可以直接驱动 DOM
          动画，不需要额外刷新状态。指示线、进度片段都能跟手势移动。
        </p>
        <p className={styles.cyanTip}>
          可以点击上面的Purple栏，再滑动回当前页面
          <br />
          观察 <b>无React刷新</b>的动画线
        </p>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>TabBar 自动滚动到视口</h3>
        <p className={styles.cyanTip}>👉 继续往右划两下，观察⬆ TabBar 的滚动。</p>
        <p className={styles.cyanParagraph}>
          自定义 TabBar 时，可以在激活项变化后把目标按钮滚到可见范围。示例里使用
          <InlineCode>ensureItemVisible</InlineCode>
          处理。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>
            示例：activeIndex 变化时滚动到当前项
          </figcaption>
          <CodeSnippet
            text={`const barRef = useRef<HTMLDivElement | null>(null);\nconst itemRefs = useRef<Array<HTMLButtonElement | null>>([]);\n\nuseEffect(() => {\n  ensureItemVisible(barRef.current, itemRefs.current[activeIndex] ?? null);\n}, [activeIndex]);\n\n<TabInnerScroll\n  ref={barRef}\n  direction="horizontal"\n  className={styles.secondLevelItemsScroller}\n>\n  {meta.items.map((item) => (\n    <button\n      key={item.key}\n      ref={(node) => {\n        itemRefs.current[item.index] = node;\n      }}\n      onClick={item.onClick}\n    >\n      {item.tab.name}\n    </button>\n  ))}\n</TabInnerScroll>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>
    </div>
  );
}
