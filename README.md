# react-app-tabs

移动端优先的 0 样式 Tabs 组件，支持：
- 完全自定义 `TabBar` / `Panel` 渲染
- 嵌套 Tabs 手势优先级管理（内层优先）
- 受控 / 非受控两种模式
- `lazyLoadDistance` 按距离懒渲染 Panel

## 安装

```bash
bun add react-app-tabs
```

> `react` / `react-dom` 为 peerDependencies，需要由使用方项目提供。

## 用法

```tsx
import { Tabs } from 'react-app-tabs';

type Item = { id: string; name: string };

const tabs: Item[] = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
];

export function Demo() {
  return (
    <Tabs
      tabs={tabs}
      keyExtractor={(tab) => tab.id}
      TabBarItemRenderer={(tab, { onClick, active }) => (
        <button
          type="button"
          onClick={onClick}
          style={{ opacity: active ? 1 : 0.6 }}
        >
          {tab.name}
        </button>
      )}
      TabPanelRenderer={(tab) => <div>{tab.name} panel</div>}
      direction="bottom"
      fit="container"
      swipable
      defaultIndex={0}
      lazyLoadDistance={3}
    />
  );
}
```

## API

```tsx
type TabItem<T> = T;
type Key = string | number;
type TabBarItemRenderMeta = {
  onClick: () => void;
  active: boolean;
  index: number;
};

type TabBarRenderItem<T> = {
  tab: TabItem<T>;
  key: Key;
  index: number;
  active: boolean;
  onClick: () => void;
};

type TabBarRenderMeta<T> = {
  items: TabBarRenderItem<T>[];
  activeIndex: number;
  direction: 'bottom' | 'left' | 'right' | 'top';
  fit: 'container' | 'content';
};

type Props<T> = {
  tabs: TabItem<T>[];
  keyExtractor: (tab: TabItem<T>) => Key;
  TabPanelRenderer: (tab: TabItem<T>) => React.ReactNode;

  onSwipe?: () => void;
  onChange?: (nextIndex: number, prevIndex: number) => undefined | boolean;
  onAfterChange?: (activeIndex: number) => void;

  defaultIndex?: number;
  activeIndex?: number;

  swipable?: boolean;
  fit?: 'container' | 'content';
  direction?: 'bottom' | 'left' | 'right' | 'top';
  lazyLoadDistance?: number;
  duration?: number;
} & (
  | {
      TabBarItemRenderer: (
        tab: TabItem<T>,
        meta: TabBarItemRenderMeta
      ) => React.ReactNode;
      TabBarClassName?: string;
      TabBarStyle?: CSSProperties;
      TabBarRenderer?: never;
    }
  | {
      TabBarRenderer: (meta: TabBarRenderMeta<T>) => React.ReactNode;
      TabBarItemRenderer?: never;
      TabBarClassName?: never;
      TabBarStyle?: never;
    }
);
```

## 嵌套手势说明

组件内部维护一个上下文层级 `layer`。当嵌套 Tabs 同时收到 `down` 事件时，会以层级更深的 Tabs 作为当前手势响应者，外层将被忽略，从而优先响应子 Panel 的 swipe。

`move` 事件统一挂在 `document`，全局只有一组监听器。拖动中会通过 `transform` 实时预览相邻 Panel，松手后使用 `transition` 平滑吸附，默认时长 `duration=300ms`，并在过渡结束后触发 `onAfterChange`。

## 本地开发

```bash
bun install
bun run check
bun run build
bun run example
```

## 示例

`example/` 提供了三层嵌套案例：
1. 第一层（底部）：`Blue / Red / Green / Yellow`
2. `Blue` Panel 内第二层（顶部）：`Sky / Cyan / Purple`，默认选中 `Cyan`
3. `Cyan` Panel 内第三层（顶部）：10 个随机 Tab

其余未特殊处理的 Panel 都渲染居中径向渐变背景。
