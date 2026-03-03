import {
  TabBarItemRenderMeta,
  TabDirection,
  TabInnerScroll,
  Tabs,
} from "../../../src";
import { ColorTab } from "../data/tabs";
import { gradientPanel } from "./panels";
import styles from "../index.module.css";

const testTabs = [
  { id: "feed", name: "Feed" },
  { id: "dir", name: "Dir" },
  { id: "nested", name: "Nested" },
] as const;

type TestTab = {
  id: (typeof testTabs)[number]["id"];
  name: string;
};

export const dirDemoTabs: ColorTab[] = [
  { id: "sun", name: "Sun", color: "#ff8f6b" },
  { id: "ocean", name: "Ocean", color: "#5ec2ff" },
  { id: "leaf", name: "Leaf", color: "#61cf93" },
];

const dirDirections: TabDirection[] = ["top", "right", "left"];
const feedLeftHeights = [128, 179, 147, 208, 140, 192, 153, 195];
const feedRightHeights = [176, 137, 217, 150, 198, 131, 188, 166];

function TestTabBarItem<T extends { id: string; name: string }>(
  tab: T,
  meta: TabBarItemRenderMeta,
) {
  return (
    <button
      key={tab.id}
      type="button"
      onClick={meta.onClick}
      className={styles.testBarButton}
      style={{ opacity: meta.active ? 1 : 0.55 }}
    >
      {tab.name}
    </button>
  );
}

export function Feed() {
  return (
    <div className={styles.feedColumns}>
      <div className={styles.feedColumn}>
        {feedLeftHeights.map((height, index) => (
          <div
            key={index}
            style={{ height, background: `hsl(${190 + index * 16} 86% 84%)` }}
          />
        ))}
      </div>
      <div className={styles.feedColumn}>
        {feedRightHeights.map((height, index) => (
          <div
            key={index}
            style={{ height, background: `hsl(${340 - index * 14} 90% 86%)` }}
          />
        ))}
      </div>
    </div>
  );
}

function FeedPanel() {
  return (
    <TabInnerScroll direction="vertical" className={styles.feedPanelScroll}>
      <h2 style={{ padding: "1em", marginBottom: 0 }}>
        绝对定位底栏需要在底部手动添加Padding
      </h2>
      <Feed />
    </TabInnerScroll>
  );
}

function DirPanel() {
  return (
    <TabInnerScroll
      direction="vertical"
      className={styles.dirPanelScroll}
      __test_name="Dir_scroller"
    >
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

function ScrollerInPanel() {
  return (
    <div className={styles.dirPanelInner} style={{ height: "100%" }}>
      <h2 style={{ padding: "1em", marginBottom: 0 }}>中间的面板包含长元素</h2>
      <section
        className={styles.dirSection}
        style={{ flexGrow: 1, minHeight: 0 }}
      >
        <Tabs
          tabs={dirDemoTabs}
          __test_name="nested"
          keyExtractor={(tab) => tab.id}
          direction="left"
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
            tab.id == "ocean" ? (
              <Feed />
            ) : (
              gradientPanel(tab.color, `${tab.name}`)
            )
          }
        />
      </section>
    </div>
  );
}
function TestTabs() {
  return (
    <div className={styles.testTabsRoot}>
      <Tabs
        __test_name="TestTabs"
        tabs={testTabs}
        keyExtractor={(tab) => tab.id}
        direction="bottom"
        defaultIndex={0}
        TabBarClassName={styles.testBar}
        TabBarItemRenderer={TestTabBarItem}
        TabPanelRenderer={(tab) => {
          if (tab.id === "feed") {
            return <FeedPanel />;
          }
          if (tab.id == "nested") {
            return <ScrollerInPanel />;
          }
          return <DirPanel />;
        }}
      />
    </div>
  );
}
export { TestTabs, TestTabBarItem };
