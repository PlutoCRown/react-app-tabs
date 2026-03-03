import React, { useEffect, useRef } from "react";
import {
  SnapTabs,
  TabBarItemRenderMeta,
  TabBarRenderMeta,
  TabInnerScroll,
} from "../../../../src";
import styles from "../../index.module.css";
import { dirDemoTabs, Feed, TestTabBarItem } from "../test-tabs";
import { gradientPanel } from "../panels";
import { ensureItemVisible } from "../../utils/scroll";
import { getUnderlineStyle } from "../../App";

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
        snapStop
        clickAnimate
        onChange={(...args) => (console.log(args), true)}
        onAfterChange={console.log}
        defaultIndex={1}
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
          id: i.toString(),
          name: `Panel_${i}`,
          color: `hsl(${190 + i * 16} 86% 84%)`,
        }))}
        keyExtractor={(i) => i.id}
        switchDuration={300}
        TabBarRenderer={AnimatedBar}
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

const AnimatedBar = (
  meta: TabBarRenderMeta<{ id: string; name: string; color: string }>,
) => {
  const { activeIndex, callback } = meta;
  const barRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const underlineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureItemVisible(barRef.current, itemRefs.current[activeIndex] ?? null);
  }, [activeIndex]);
  useEffect(() => {
    // 这里如果能实现animatedValue那种东西就好了
    callback.onSwipe((progress) => applyUnderline(progress, false));
    callback.onChange((active) => applyUnderline(active, true));
    return callback.clear;
  }, []);

  const applyUnderline = React.useCallback(
    (progress: number, animate: boolean) => {
      const underline = underlineRef.current;
      if (!underline) {
        return;
      }
      const underlineStyle = getUnderlineStyle(itemRefs.current, progress);
      if (!underlineStyle) {
        return;
      }
      underline.style.transition = animate
        ? `transform 300ms ease, width 300ms ease`
        : "none";
      underline.style.transform = underlineStyle.transform;
      underline.style.width = `${underlineStyle.width}px`;
    },
    [],
  );

  return (
    <div ref={barRef} className={styles.guideTabBar}>
      <div style={{ whiteSpace: "pre", position: "relative" }}>
        {meta.items.map((item) => (
          <button
            key={item.key}
            ref={(node) => {
              itemRefs.current[item.index] = node;
            }}
            type="button"
            onClick={item.onClick}
            className={styles.defaultTabButton}
            style={{ opacity: item.active ? 1 : 0.62 }}
            //   borderBottom: item.active
            //   ? "2px solid #0e1116"
            //   : "2px solid transparent",
          >
            {item.tab.name}
          </button>
        ))}
        <div ref={underlineRef} className={styles.secondLevelUnderline} />
      </div>
    </div>
  );
};
