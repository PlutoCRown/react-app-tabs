import React, { useMemo } from 'react';
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
  for (let i = 0; i < 7; i += 1) {
    const hue = Math.floor(Math.random() * 360);
    items.push({
      id: `random-${i}`,
      name: `Cyan-${i + 1}`,
      color: `hsl(${hue} 84% 56%)`,
    });
  }
  return items;
}

function defaultTabLabel(tab: ColorTab, meta: TabBarItemRenderMeta) {
  const { active, onClick } = meta;
  return (
    <button
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

function secondLevelTabBar(meta: TabBarRenderMeta<ColorTab>) {
  return (
    <div className={styles.secondLevelCustomBar}>
      <TabInnerScroll
        __test_name="Bar_2"
        direction="horizontal"
        className={styles.secondLevelItemsScroller}
      >
        {meta.items.map((item) => (
          <React.Fragment key={item.key}>
            {defaultTabLabel(item.tab, {
              onClick: item.onClick,
              active: item.active,
              index: item.index,
            })}
          </React.Fragment>
        ))}
      </TabInnerScroll>
      <h1 className={styles.secondLevelTitle}>React App Tab</h1>
    </div>
  );
}

function thirdLevelTabBar(meta: TabBarRenderMeta<ColorTab>) {
  return (
    <TabInnerScroll __test_name="Bar_3" direction="horizontal" className={styles.thirdLevelBar}>
      {meta.items.map((item) => (
        <React.Fragment key={item.key}>
          {defaultTabLabel(item.tab, {
            onClick: item.onClick,
            active: item.active,
            index: item.index,
          })}
        </React.Fragment>
      ))}
    </TabInnerScroll>
  );
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
      TabBarRenderer={thirdLevelTabBar}
      TabPanelRenderer={(tab) => gradientPanel(tab.color, tab.name)}
    />
  );
}

function SecondLevelTabs() {
  const [active, setActive] = React.useState(1);

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
      TabBarRenderer={secondLevelTabBar}
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
