import React, { useEffect, useMemo, useRef } from 'react';
import { TabBarRenderMeta, TabInnerScroll, Tabs } from '../../src';
import { levelOneTabs, levelTwoTabs, ColorTab } from './data/tabs';
import { gradientPanel, thirdLevelTabs, ThirdLevelTab } from './components/panels';
import { defaultTabLabel, levelOneTabLabel } from './components/tab-labels';
import { ensureItemVisible } from './utils/scroll';
import styles from './index.module.css';

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
            borderBottom: item.active ? '2px solid #0e1116' : '2px solid transparent',
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
  const barRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    ensureItemVisible(barRef.current, itemRefs.current[active] ?? null);
  }, [active]);

  const renderBar = (meta: TabBarRenderMeta<ColorTab>) => (
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
            )}
          </React.Fragment>
        ))}
      </TabInnerScroll>
      <h1 className={styles.secondLevelTitle}>React App Tab</h1>
    </div>
  );

  return (
    <Tabs
      __test_name="Tab_2"
      tabs={levelTwoTabs}
      keyExtractor={(tab) => tab.id}
      direction="top"
      activeIndex={active}
      onChange={(next) => {
        setActive(next);
        return true;
      }}
      TabBarRenderer={renderBar}
      TabPanelRenderer={(tab) => {
        if (tab.id === 'cyan') {
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
          if (tab.id === 'blue') {
            return <SecondLevelTabs />;
          }
          return gradientPanel(tab.color, tab.name);
        }}
      />
    </div>
  );
}
