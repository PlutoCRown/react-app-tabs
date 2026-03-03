import React from "react";
import { SnapTabs, TabInnerScroll } from "../../../../src";
import styles from "../../index.module.css";
import { dirDemoTabs, Feed, TestTabBarItem } from "../test-tabs";
import { gradientPanel } from "../panels";

const testTabs = [
  { id: "sky", name: "Sky", color: "#55c3ff" },
  { id: "cyan", name: "Cyan", color: "#00d5d5" },
  { id: "purple", name: "Purple", color: "#7a6bff" },
  { id: "midnight", name: "Midnight", color: "#191970" },
] as const;

const TestSnapTabs = () => {
  return (
    <TabInnerScroll
      stopPropagation
      direction="horizontal"
      style={{
        height: "100%",
        padding: "1em",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>此页无法回头</h1>
      <SnapTabs
        tabs={testTabs}
        keyExtractor={(i) => i.id}
        TabPanelRenderer={(tab) => {
          if (tab.id === "purple") {
            return <InnerLayerH />;
          }
          if (tab.id === "midnight") {
            return <InnerLayerV />;
          }
          return gradientPanel(tab.color, tab.name);
        }}
        style={{ gap: 12 }}
        TabBarClassName={styles.firstLevelBar}
        TabBarStyle={{ borderRadius: 18, padding: "0.4em", gap: 6 }}
        TabBarItemRenderer={TestTabBarItem}
      />
    </TabInnerScroll>
  );
};

export default TestSnapTabs;

const InnerLayerH = () => {
  return (
    <section className={styles.dirSection} style={{ height: "100%" }}>
      <SnapTabs
        tabs={new Array(8).fill(0).map((_, i) => ({
          id: i,
          name: `Panel_${i}`,
          color: `hsl(${190 + i * 16} 86% 84%)`,
        }))}
        keyExtractor={(i) => i.id}
        switchDuration={300}
        TabBarItemRenderer={(tab, meta) => (
          <button
            type="button"
            onClick={meta.onClick}
            className={styles.defaultTabButton}
            style={{ opacity: meta.active ? 1 : 0.55 }}
          >
            {tab.name}
          </button>
        )}
        TabPanelRenderer={(tab) => gradientPanel(tab.color, tab.name)}
      />
    </section>
  );
};

const InnerLayerV = () => {
  return (
    <section className={styles.dirSection} style={{ height: "100%" }}>
      <SnapTabs
        tabs={dirDemoTabs}
        direction="left"
        keyExtractor={(i) => i.id}
        switchDuration={300}
        TabBarItemRenderer={(tab, meta) => (
          <button
            type="button"
            onClick={meta.onClick}
            className={styles.defaultTabButton}
            style={{ opacity: meta.active ? 1 : 0.55 }}
          >
            {tab.name}
          </button>
        )}
        TabPanelRenderer={(tab) =>
          tab.id == "ocean" ? <Feed /> : gradientPanel(tab.color, `${tab.name}`)
        }
      />
    </section>
  );
};
