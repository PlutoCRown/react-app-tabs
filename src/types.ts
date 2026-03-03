import type { CSSProperties, ReactNode } from 'react';

export type Key = string | number;

export type TabItem<T> = T;

export type TabDirection = 'bottom' | 'left' | 'right' | 'top';

export type TabFit = 'container' | 'content';

export type TabBarItemRenderMeta = {
  onClick: () => void;
  active: boolean;
  index: number;
};

export type TabBarRenderItem<T> = {
  tab: TabItem<T>;
  key: Key;
  index: number;
  active: boolean;
  onClick: () => void;
};

export type TabBarRenderMeta<T> = {
  items: TabBarRenderItem<T>[];
  activeIndex: number;
  direction: TabDirection;
  fit: TabFit;
  duration: number,
  callback: {
    onSwipe: (callback: (progress: number) => void) => void;
    onChange: (callback: (activeIndex: number) => void) => void;
    clear: () => void;
  };
};

export type TabsBaseProps<T> = {
  __test_name?: string;
  className?: string;
  style?: CSSProperties;
  tabs: readonly TabItem<T>[];
  keyExtractor: (tab: TabItem<T>) => Key;
  TabPanelRenderer: (tab: TabItem<T>) => ReactNode;
  onSwipe?: (progress: number) => void;
  onChange?: (nextIndex: number, prevIndex: number) => undefined | boolean;
  onAfterChange?: (activeIndex: number) => void;
  defaultIndex?: number;
  activeIndex?: number;
  swipable?: boolean;
  fit?: TabFit;
  direction?: TabDirection;
  lazyLoadDistance?: number;
  duration?: number;
  switchDuration?: number;
};

export type TabsWithDefaultBarProps<T> = {
  TabBarItemRenderer: (tab: TabItem<T>, meta: TabBarItemRenderMeta) => ReactNode;
  TabBarClassName?: string;
  TabBarStyle?: CSSProperties;
  TabBarRenderer?: never;
};

export type TabsWithCustomBarProps<T> = {
  TabBarRenderer: (meta: TabBarRenderMeta<T>) => ReactNode;
  TabBarItemRenderer?: never;
  TabBarClassName?: never;
  TabBarStyle?: never;
};

export type TabsProps<T> = TabsBaseProps<T> &
  (TabsWithDefaultBarProps<T> | TabsWithCustomBarProps<T>);

export type TabsRef = {
  getActiveIndex: () => number;
  setActiveIndex: (nextIndex: number) => void;
};

export type ReactAppTabsContextType = {
  layer: number;
  activeIndex: number;
  getConfig: () => TabItem<any> | undefined;
  getPrevLayer: () => ReactAppTabsContextType | undefined;
};

export type InnerScrollController = {
  testName?: string;
  shouldAllowParentSwipe: (dx: number, dy: number) => boolean;
};

export type InternalTabsContextType = ReactAppTabsContextType & {
  requestSwipe: (step: -1 | 1) => boolean;
  previewSwipe: (dx: number) => 'self' | 'parent' | 'none';
  clearPreview: () => void;
};
