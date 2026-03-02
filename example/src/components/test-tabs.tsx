import React, { useState } from "react";
import {
  TabBarRenderMeta,
  TabDirection,
  TabInnerScroll,
  Tabs,
} from "../../../src";
import { ColorTab } from "../data/tabs";
import { gradientPanel } from "./panels";
import styles from "../index.module.css";

type TestTab = {
  id: "feed" | "dir";
  name: string;
};

const testTabs: TestTab[] = [
  { id: "feed", name: "Feed" },
  { id: "dir", name: "Dir" },
];

const dirDemoTabs: ColorTab[] = [
  { id: "sun", name: "Sun", color: "#ff8f6b" },
  { id: "ocean", name: "Ocean", color: "#5ec2ff" },
  { id: "leaf", name: "Leaf", color: "#61cf93" },
];

// const dirDirections: TabDirection[] = ["right"];
const dirDirections: TabDirection[] = ["top", "right", "left"];

const feedLeftHeights = [80, 112, 92, 130, 88, 120, 96, 122].map(
  (i) => i * 1.6,
);
const feedRightHeights = [110, 86, 136, 94, 124, 82, 118, 104].map(
  (i) => i * 1.6,
);

function TestTabBar({ items }: TabBarRenderMeta<TestTab>) {
  return (
    <div className={styles.testBar}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className={styles.testBarButton}
          style={{ opacity: item.active ? 1 : 0.55 }}
        >
          {item.tab.name}
        </button>
      ))}
    </div>
  );
}

function FeedPanel() {
  return (
    <TabInnerScroll direction="vertical" className={styles.feedPanelScroll}>
      <h2 style={{ padding: "1em", marginBottom: 0 }}>
        绝对定位底栏需要在底部手动添加Padding
      </h2>
      <div className={styles.feedColumns}>
        <div className={styles.feedColumn}>
          {feedLeftHeights.map((height, index) => (
            <div
              key={`left-${index}`}
              className={styles.feedSkeletonCard}
              style={{ height, background: `hsl(${190 + index * 16} 86% 84%)` }}
            />
          ))}
        </div>
        <div className={styles.feedColumn}>
          {feedRightHeights.map((height, index) => (
            <div
              key={`right-${index}`}
              className={styles.feedSkeletonCard}
              style={{ height, background: `hsl(${340 - index * 14} 90% 86%)` }}
            />
          ))}
        </div>
      </div>
    </TabInnerScroll>
  );
}

function DirPanel() {
  return (
    <TabInnerScroll direction="vertical" className={styles.dirPanelScroll} __test_name="Dir_scroller">
      <h2 style={{ padding: "1em", marginBottom: 0 }}>
        各方向测试 & 同方向Scroller+Tab交替使用
      </h2>
      <div className={styles.dirPanelInner}>
        {dirDirections.map((direction) => (
          <section key={direction} className={styles.dirSection}>
            <h4 className={styles.dirTitle}>Direction: {direction}</h4>
            <div className={styles.dirTabsDemo}>
              <Tabs
                tabs={dirDemoTabs}
                __test_name={`Direction-${direction}`}
                keyExtractor={(tab) => `${direction}-${tab.id}`}
                direction={direction}
                defaultIndex={0}
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
                  gradientPanel(
                    tab.color,
                    `${direction.toUpperCase()} · ${tab.name}`,
                  )
                }
              />
            </div>
          </section>
        ))}
      </div>
    </TabInnerScroll>
  );
}

export function TestTabs() {
  // 测试受控
  const [active, setActive] = useState(1);
  return (
    <div className={styles.testTabsRoot}>
      <Tabs
        __test_name="TestTabs"
        tabs={testTabs}
        keyExtractor={(tab) => tab.id}
        direction="bottom"
        activeIndex={active}
        onChange={(index) => (setActive(index), true)}
        TabBarRenderer={TestTabBar}
        TabPanelRenderer={(tab) => {
          if (tab.id === "feed") {
            return <FeedPanel />;
          }
          return <DirPanel />;
        }}
      />
    </div>
  );
}
