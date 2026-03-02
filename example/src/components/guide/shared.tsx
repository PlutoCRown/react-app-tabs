import React from "react";
import { TabInnerScroll } from "../../../../src";
import styles from "../../index.module.css";

export function docPanelStyle(color: string) {
  return {
    background: `linear-gradient(145deg, ${color}21 0%, #ffffff 46%, ${color}12 100%)`,
  } as const;
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className={styles.cyanInlineCode}>{children}</code>;
}

export function CodeSnippet({ text }: { text: string }) {
  return (
    <TabInnerScroll
      direction="horizontal"
      className={styles.cyanCodeBlock}
      as="pre"
    >
      {text}
    </TabInnerScroll>
  );
}

export function storyCard(title: string, body: React.ReactNode) {
  return (
    <div className={styles.cyanStoryCard}>
      <h4 className={styles.cyanStoryTitle}>{title}</h4>
      <p className={styles.cyanParagraph}>{body}</p>
    </div>
  );
}
