import React from "react";
import styles from "../../index.module.css";
import { CodeSnippet, InlineCode, docPanelStyle } from "./shared";

export default function Guide2({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 01</div>
        <h2 className={styles.cyanDocTitle}>Tabs 接入</h2>
        <p className={styles.cyanLeadMini}>
          起步配置：<InlineCode>TabBarItemRenderer</InlineCode>
          {" + "}
          <InlineCode>TabBarClassName</InlineCode>。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <p className={styles.cyanParagraph}>
          这个方案适合统一结构的标签栏。你只写 item
          的渲染，组件处理状态、切换、过渡。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>起步版本</figcaption>
          <CodeSnippet
            text={`<Tabs
  tabs={tabs}
  keyExtractor={(tab) => tab.id}
  TabBarClassName={styles.tabBar}
  TabBarItemRenderer={(tab, meta) => (
    <button
      type="button"
      onClick={meta.onClick}
      style={{ opacity: meta.active ? 1 : 0.58 }}
    >
      {tab.title}
    </button>
  )}
  TabPanelRenderer={(tab) => <Panel tab={tab} />}
/>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>
    </div>
  );
}
