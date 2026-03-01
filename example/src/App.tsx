import React, { useMemo } from 'react';
import { Tabs } from '../../src';

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
];

function randomTabs(): ColorTab[] {
  const items: ColorTab[] = [];
  for (let i = 0; i < 10; i += 1) {
    const hue = Math.floor(Math.random() * 360);
    items.push({
      id: `random-${i}`,
      name: `Random-${i + 1}`,
      color: `hsl(${hue} 84% 56%)`,
    });
  }
  return items;
}

function tabLabel(tab: ColorTab, active: boolean, dark = false) {
  return (
    <div
      style={{
        width: '100%',
        padding: '10px 12px',
        fontSize: 13,
        fontWeight: 700,
        color: '#0e1116',
        opacity: active ? 1 : 0.55,
        borderBottom: dark ? 'none' : active ? '2px solid #0e1116' : '2px solid transparent',
        textAlign: 'center',
        letterSpacing: 0.4,
      }}
    >
      {tab.name}
    </div>
  );
}

function gradientPanel(color: string, label: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        background: `radial-gradient(circle at 50% 30%, ${color}, transparent 72%)`,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, color: '#0f1722' }}>{label}</div>
    </div>
  );
}

function ThirdLevelTabs() {
  const tabs = useMemo(() => randomTabs(), []);
  return (
    <Tabs
      tabs={tabs}
      keyExtractor={(tab) => tab.id}
      direction="top"
      swipable
      fit="content"
      TabBarStyle={{
        display: 'flex',
        overflowX: 'auto',
        borderBottom: '1px solid #e8edf5',
        background: '#fff',
      }}
      TabBarRenderer={(tab) => tabLabel(tab, false)}
      TabPanelRenderer={(tab) => gradientPanel(tab.color, tab.name)}
    />
  );
}

function SecondLevelTabs() {
  const [active, setActive] = React.useState(1);

  return (
    <Tabs
      tabs={levelTwoTabs}
      keyExtractor={(tab) => tab.id}
      direction="top"
      swipable
      activeIndex={active}
      onChange={(next) => {
        setActive(next);
        return true;
      }}
      TabBarStyle={{
        borderBottom: '1px solid #e5ebf5',
        background: '#f8fbff',
      }}
      TabBarRenderer={(tab) => tabLabel(tab, tab.id === levelTwoTabs[active]?.id)}
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
    <div style={{ width: '100%', height: '100%', background: '#f1f6ff' }}>
      <Tabs
        tabs={levelOneTabs}
        keyExtractor={(tab) => tab.id}
        direction="bottom"
        swipable
        activeIndex={active}
        onChange={(next) => {
          setActive(next);
          return true;
        }}
        TabBarStyle={{
          borderTop: '1px solid #dce5f6',
          background: '#fff',
        }}
        TabBarRenderer={(tab) => tabLabel(tab, tab.id === levelOneTabs[active]?.id, true)}
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
