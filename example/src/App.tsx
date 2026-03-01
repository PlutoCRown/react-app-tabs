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

function defaultTabLabel(tab: ColorTab, active: boolean) {
  return (
    <div
      style={{
        width: '100%',
        textWrap: 'nowrap',
        padding: '10px 12px',
        fontSize: 13,
        fontWeight: 700,
        color: '#0e1116',
        opacity: active ? 1 : 0.55,
        borderBottom: active ? '2px solid #0e1116' : '2px solid transparent',
        textAlign: 'center',
        letterSpacing: 0.4,
      }}
    >
      {tab.name}
    </div>
  );
}

function levelOneTabLabel(tab: ColorTab, active: boolean) {
  return (
    <div
      style={{
        width: '100%',
        padding: '8px 10px 10px',
        display: 'grid',
        justifyItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: active ? tab.color : '#b8c0cf',
          transition: 'background 220ms ease',
        }}
      />
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.3,
          color: active ? '#0e1116' : '#7f8aa0',
          textWrap: 'nowrap',
        }}
      >
        {tab.name}
      </div>
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
  const [active, setActive] = React.useState(0);

  return (
    <Tabs
      tabs={tabs}
      keyExtractor={(tab) => tab.id}
      direction="top"
      swipable
      fit="content"
      TabBarClassName="third-level-bar"
      activeIndex={active}
      onChange={(next) => {
        setActive(next);
        return true;
      }}
      TabBarStyle={{
        display: 'flex',
        overflowX: 'auto',
        borderBottom: '1px solid #e8edf5',
        background: '#fff',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      TabBarRenderer={(tab) => defaultTabLabel(tab, tab.id === tabs[active]?.id)}
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
      fit="content"
      activeIndex={active}
      onChange={(next) => {
        setActive(next);
        return true;
      }}
      TabBarStyle={{
        justifyContent: 'flex-start',
        borderBottom: '1px solid #e5ebf5',
        background: '#f8fbff',
      }}
      TabBarRenderer={(tab) => defaultTabLabel(tab, tab.id === levelTwoTabs[active]?.id)}
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
      <style>{`.third-level-bar::-webkit-scrollbar{display:none;}`}</style>
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
        TabBarRenderer={(tab) => levelOneTabLabel(tab, tab.id === levelOneTabs[active]?.id)}
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
