import React from 'react';
import { TabBarItemRenderMeta } from '../../../src';
import { ColorTab } from '../data/tabs';
import styles from '../index.module.css';

export function defaultTabLabel(
  tab: ColorTab,
  meta: TabBarItemRenderMeta,
  ref?: React.Ref<HTMLButtonElement>,
  options?: { showActiveUnderline?: boolean },
) {
  const { active, onClick } = meta;
  const showActiveUnderline = options?.showActiveUnderline ?? true;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={styles.defaultTabButton}
      style={{
        opacity: active ? 1 : 0.55,
        borderBottom: showActiveUnderline && active ? '2px solid #0e1116' : '2px solid transparent',
      }}
    >
      {tab.name}
    </button>
  );
}

export function levelOneTabLabel(tab: ColorTab, meta: TabBarItemRenderMeta) {
  const { active, onClick } = meta;
  return (
    <button type="button" onClick={onClick} className={styles.levelOneButton}>
      <div className={styles.levelOneDot} style={{ background: active ? tab.color : '#b8c0cf' }} />
      <div className={styles.levelOneName} style={{ color: active ? '#0e1116' : '#7f8aa0' }}>
        {tab.name}
      </div>
    </button>
  );
}
