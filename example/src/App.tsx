import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { TabBarRenderMeta, TabInnerScroll, Tabs } from "../../src";
import { levelOneTabs, levelTwoTabs, ColorTab } from "./data/tabs";
import { gradientPanel } from "./components/panels";
import { guideTabs, GuideTab } from "./components/guide";
import { defaultTabLabel, levelOneTabLabel } from "./components/tab-labels";
import { TestTabs } from "./components/test-tabs";
import { ensureItemVisible } from "./utils/scroll";
import styles from "./index.module.css";
import TestSnapTabs from "./components/snap";

export function getUnderlineStyle(
  refs: Array<HTMLButtonElement | null>,
  progress: number,
): { transform: string; width: number } | null {
  const maxIndex = refs.length - 1;
  if (maxIndex < 0) {
    return null;
  }
  const clampedProgress = Math.min(maxIndex, Math.max(0, progress));
  const startIndex = Math.floor(clampedProgress);
  const endIndex = Math.ceil(clampedProgress);
  const ratio = clampedProgress - startIndex;
  const start = refs[startIndex];
  const end = refs[endIndex];
  if (!start || !end) {
    return null;
  }
  const left = start.offsetLeft + (end.offsetLeft - start.offsetLeft) * ratio;
  const width =
    start.offsetWidth + (end.offsetWidth - start.offsetWidth) * ratio;
  return {
    transform: `translate3d(${left}px, 0px, 0)`,
    width,
  };
}

const GuideTabBar = (meta: TabBarRenderMeta<GuideTab>) => {
  const { activeIndex } = meta;
  const barRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    ensureItemVisible(barRef.current, itemRefs.current[activeIndex] ?? null);
  }, [activeIndex]);

  return (
    <TabInnerScroll
      ref={barRef}
      __test_name="Bar_3"
      direction="horizontal"
      className={styles.guideTabBar}
    >
      {meta.items.map((item) => (
        <button
          key={item.key}
          ref={(node) => {
            itemRefs.current[item.index] = node;
          }}
          type="button"
          onClick={item.onClick}
          className={styles.defaultTabButton}
          style={{
            opacity: item.active ? 1 : 0.62,
            borderBottom: item.active
              ? "2px solid #0e1116"
              : "2px solid transparent",
          }}
        >
          {item.tab.title}
        </button>
      ))}
    </TabInnerScroll>
  );
};

function GuideTabs() {
  const tabs = useMemo(() => guideTabs, []);
  const [active, setActive] = React.useState(0);

  return (
    <Tabs
      __test_name="Tab_3"
      tabs={tabs}
      keyExtractor={(tab) => tab.id}
      direction="top"
      activeIndex={active}
      onChange={(next) => {
        setActive(next);
        return true;
      }}
      TabBarRenderer={GuideTabBar}
      TabPanelRenderer={({ Render, color }) => <Render color={color} />}
    />
  );
}

const SecondLevelBar = (meta: TabBarRenderMeta<ColorTab>) => {
  const { activeIndex, callback, duration } = meta;

  const barRef = useRef<HTMLDivElement | null>(null);
  const underlineRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
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
        ? `transform ${duration}ms ease, width ${duration}ms ease`
        : "none";
      underline.style.transform = underlineStyle.transform;
      underline.style.width = `${underlineStyle.width}px`;
    },
    [],
  );

  useLayoutEffect(() => {
    applyUnderline(activeIndex, false);
  }, []);

  return (
    <div className={styles.secondLevelCustomBar}>
      <TabInnerScroll
        ref={barRef}
        __test_name="Bar_2"
        direction="horizontal"
        className={styles.secondLevelItemsScroller}
      >
        {meta.items.map((item) => (
          <React.Fragment key={item.key}>
            {defaultTabLabel(
              item.tab,
              {
                onClick: item.onClick,
                active: item.active,
                index: item.index,
              },
              (node) => {
                itemRefs.current[item.index] = node;
              },
              { showActiveUnderline: false },
            )}
          </React.Fragment>
        ))}
        <div ref={underlineRef} className={styles.secondLevelUnderline} />
      </TabInnerScroll>
      <h1 className={styles.secondLevelTitle}>React App Tab</h1>
    </div>
  );
};

function SecondLevelTabs() {
  return (
    <Tabs
      __test_name="Tab_2"
      tabs={levelTwoTabs}
      keyExtractor={(tab) => tab.id}
      direction="top"
      defaultIndex={1}
      TabBarRenderer={SecondLevelBar}
      TabPanelRenderer={(tab) => {
        if (tab.id === "cyan") {
          return <GuideTabs />;
        }
        return gradientPanel(tab.color, tab.name);
      }}
    />
  );
}

export function App() {
  const [active, setActive] = React.useState(0);

  return (
    <div className={styles.appRoot}>
      <Tabs
        __test_name="Tab_1"
        tabs={levelOneTabs}
        keyExtractor={(tab) => tab.id}
        direction="bottom"
        activeIndex={active}
        onChange={(next) => {
          setActive(next);
          return true;
        }}
        TabBarClassName={styles.firstLevelBar}
        TabBarItemRenderer={levelOneTabLabel}
        TabPanelRenderer={(tab) => {
          if (tab.id === "blue") {
            return <SecondLevelTabs />;
          }
          if (tab.id === "red") {
            return <TestTabs />;
          }
          if (tab.id == "yellow") {
            return <TestSnapTabs />;
          }
          return gradientPanel(tab.color, tab.name);
        }}
      />
    </div>
  );
}
