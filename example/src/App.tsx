import React, { useEffect, useMemo, useRef } from 'react';
import { TabBarItemRenderMeta, TabBarRenderMeta, TabInnerScroll, Tabs } from '../../src';
import styles from './index.module.css';

type ColorTab = {
  id: string;
  name: string;
  color: string;
};

const levelOneTabs: ColorTab[] = [
  { id: 'blue', name: 'Blue', color: '#0a66ff' },
  { id: 'red', name: 'Red', color: '#f5365c' },
  { id: 'green', name: 'Green', color: '#27ae60' },
  { id: 'yellow', name: 'Yellow', color: '#f6c445' },
];

const levelTwoTabs: ColorTab[] = [
  { id: 'sky', name: 'Sky', color: '#55c3ff' },
  { id: 'cyan', name: 'Cyan', color: '#00d5d5' },
  { id: 'purple', name: 'Purple', color: '#7a6bff' },
  { id: 'midnight', name: 'Midnight', color: '#191970' },
];

function randomTabs(): ColorTab[] {
  const items: ColorTab[] = [];
  for (let i = 0; i < 9; i += 1) {
    const hue = Math.floor(Math.random() * 360);
    items.push({
      id: `random-${i}`,
      name: `Cyan-${i + 1}`,
      color: `hsl(${hue} 84% 56%)`,
    });
  }
  return items;
}

function defaultTabLabel(
  tab: ColorTab,
  meta: TabBarItemRenderMeta,
  ref?: React.Ref<HTMLButtonElement>,
) {
  const { active, onClick } = meta;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={styles.defaultTabButton}
      style={{
        opacity: active ? 1 : 0.55,
        borderBottom: active ? '2px solid #0e1116' : '2px solid transparent',
      }}
    >
      {tab.name}
    </button>
  );
}

function ensureItemVisible(container: HTMLDivElement | null, item: HTMLElement | null) {
  if (!container || !item) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const epsilon = 1;
  const fullyVisible =
    itemRect.left >= containerRect.left + epsilon &&
    itemRect.right <= containerRect.right - epsilon;
  if (fullyVisible) {
    return;
  }

  if (itemRect.left < containerRect.left) {
    const delta = itemRect.left - containerRect.left;
    container.scrollTo({ left: container.scrollLeft + delta, behavior: 'smooth' });
    return;
  }
  if (itemRect.right > containerRect.right) {
    const delta = itemRect.right - containerRect.right;
    container.scrollTo({ left: container.scrollLeft + delta, behavior: 'smooth' });
  }
}

function levelOneTabLabel(tab: ColorTab, meta: TabBarItemRenderMeta) {
  const { active, onClick } = meta;
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.levelOneButton}
    >
      <div
        className={styles.levelOneDot}
        style={{ background: active ? tab.color : '#b8c0cf' }}
      />
      <div
        className={styles.levelOneName}
        style={{ color: active ? '#0e1116' : '#7f8aa0' }}
      >
        {tab.name}
      </div>
    </button>
  );
}

function gradientPanel(color: string, label: string) {
  return (
    <div
      className={styles.gradientPanel}
      style={{ background: `radial-gradient(circle at 50% 30%, ${color}, transparent 72%)` }}
    >
      <div className={styles.gradientLabel}>{label}</div>
    </div>
  );
}

function ThirdLevelTabs() {
  const tabs = useMemo(() => randomTabs(), []);
  const [active, setActive] = React.useState(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    ensureItemVisible(barRef.current, itemRefs.current[active] ?? null);
  }, [active]);

  const renderBar = (meta: TabBarRenderMeta<ColorTab>) => (
    <TabInnerScroll
      ref={barRef}
      __test_name="Bar_3"
      direction="horizontal"
      className={styles.thirdLevelBar}
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
      TabPanelRenderer={(tab) => gradientPanel(tab.color, tab.name)}
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
