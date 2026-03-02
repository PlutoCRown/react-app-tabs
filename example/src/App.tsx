import React, { useEffect, useMemo, useRef } from "react";
import { TabBarRenderMeta, TabInnerScroll, Tabs } from "../../src";
import { levelOneTabs, levelTwoTabs, ColorTab } from "./data/tabs";
import {
  gradientPanel,
  thirdLevelTabs,
  ThirdLevelTab,
} from "./components/panels";
import { defaultTabLabel, levelOneTabLabel } from "./components/tab-labels";
import { ensureItemVisible } from "./utils/scroll";
import styles from "./index.module.css";

function getUnderlineStyle(
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

function ThirdLevelTabs() {
  const tabs = useMemo(() => thirdLevelTabs, []);
  const [active, setActive] = React.useState(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    ensureItemVisible(barRef.current, itemRefs.current[active] ?? null);
  }, [active]);

  const renderBar = (meta: TabBarRenderMeta<ThirdLevelTab>) => (
    <TabInnerScroll
      ref={barRef}
      __test_name="Bar_3"
      direction="horizontal"
      className={styles.thirdLevelBar}
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
      TabBarRenderer={renderBar}
      TabPanelRenderer={({ Render, color }) => <Render color={color} />}
    />
  );
}

function SecondLevelTabs() {
  const [active, setActive] = React.useState(1);
  const [underlineProgress, setUnderlineProgress] = React.useState(1);
  const [underlineAnimating, setUnderlineAnimating] = React.useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    ensureItemVisible(barRef.current, itemRefs.current[active] ?? null);
  }, [active]);

  const renderBar = (meta: TabBarRenderMeta<ColorTab>) => {
    const underlineStyle = getUnderlineStyle(itemRefs.current, underlineProgress);
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
          {underlineStyle ? (
            <div
              className={styles.secondLevelUnderline}
              style={{
                transform: underlineStyle.transform,
                width: underlineStyle.width,
                transition: underlineAnimating
                  ? 'transform 300ms ease, width 300ms ease'
                  : undefined,
              }}
            />
          ) : null}
        </TabInnerScroll>
        <h1 className={styles.secondLevelTitle}>React App Tab</h1>
      </div>
    );
  };

  return (
    <Tabs
      __test_name="Tab_2"
      tabs={levelTwoTabs}
      keyExtractor={(tab) => tab.id}
      direction="top"
      activeIndex={active}
      onSwipe={(progress) => {
        setUnderlineAnimating(false);
        setUnderlineProgress(progress);
      }}
      onChange={(next) => {
        setActive(next);
        setUnderlineAnimating(true);
        setUnderlineProgress(next);
        return true;
      }}
      onAfterChange={(next) => {
        setUnderlineAnimating(false);
        setUnderlineProgress(next);
      }}
      TabBarRenderer={renderBar}
      TabPanelRenderer={(tab) => {
        if (tab.id === "cyan") {
          return <ThirdLevelTabs />;
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
          return gradientPanel(tab.color, tab.name);
        }}
      />
    </div>
  );
}
