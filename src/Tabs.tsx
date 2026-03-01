import React, {
  CSSProperties,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type Key = string | number;

export type TabItem<T> = T;

export type TabsProps<T> = {
  tabs: TabItem<T>[];
  keyExtractor: (tab: TabItem<T>) => Key;
  TabBarRenderer: (tab: TabItem<T>) => ReactNode;
  TabPanelRenderer: (tab: TabItem<T>) => ReactNode;
  TabBarClassName?: string;
  TabBarStyle?: CSSProperties;
  onSwipe?: () => void;
  onChange?: (nextIndex: number, prevIndex: number) => undefined | boolean;
  onAfterChange?: (activeIndex: number) => void;
  defaultIndex?: number;
  activeIndex?: number;
  swipable?: boolean;
  fit?: 'container' | 'content';
  direction?: 'bottom' | 'left' | 'right' | 'top';
  lazyLoadDistance?: number;
};

export type ReactAppTabsContextType = {
  layer: number;
  activeIndex: number;
  getConfig: () => TabItem<any> | undefined;
  getPrevLayer: () => ReactAppTabsContextType | undefined;
};

const TabsContext = createContext<ReactAppTabsContextType | undefined>(undefined);

let globalGestureId = 1;

type GestureSession = {
  id: number;
  layer: number;
  onMove: (dx: number, dy: number) => void;
  onEnd: (dx: number, dy: number) => void;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

const gestureManager = (() => {
  let current: GestureSession | null = null;
  let attached = false;

  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (!current) {
      return;
    }
    const point = getClientPoint(event);
    if (!point) {
      return;
    }
    current.currentX = point.x;
    current.currentY = point.y;
    current.onMove(point.x - current.startX, point.y - current.startY);
  };

  const handleEnd = () => {
    if (!current) {
      return;
    }
    const dx = current.currentX - current.startX;
    const dy = current.currentY - current.startY;
    current.onEnd(dx, dy);
    current = null;
  };

  return {
    ensureListeners() {
      if (attached || typeof document === 'undefined') {
        return;
      }
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: true });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
      attached = true;
    },
    start(session: GestureSession) {
      if (!current || session.layer > current.layer) {
        current = session;
      }
    },
    maybeEnd(id: number) {
      if (!current || current.id !== id) {
        return;
      }
      const dx = current.currentX - current.startX;
      const dy = current.currentY - current.startY;
      current.onEnd(dx, dy);
      current = null;
    },
  };
})();

function getClientPoint(event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
  if ('touches' in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) {
      return null;
    }
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

function clampIndex(index: number, size: number) {
  if (size <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(size - 1, index));
}

function getBarFlexDirection(direction: NonNullable<TabsProps<any>['direction']>) {
  if (direction === 'left' || direction === 'right') {
    return 'column';
  }
  return 'row';
}

function getRootFlexDirection(direction: NonNullable<TabsProps<any>['direction']>) {
  if (direction === 'top' || direction === 'bottom') {
    return 'column';
  }
  return 'row';
}

export function useReactAppTabsContext() {
  return useContext(TabsContext);
}

export function Tabs<T>(props: TabsProps<T>) {
  const {
    tabs,
    keyExtractor,
    TabBarRenderer,
    TabPanelRenderer,
    TabBarClassName,
    TabBarStyle,
    onSwipe,
    onChange,
    onAfterChange,
    defaultIndex = 0,
    activeIndex,
    swipable = true,
    fit = 'container',
    direction = 'bottom',
    lazyLoadDistance = 3,
  } = props;

  const parent = useContext(TabsContext);
  const layer = (parent?.layer ?? -1) + 1;
  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(() => clampIndex(defaultIndex, tabs.length));
  const resolvedActiveIndex = clampIndex(
    isControlled ? (activeIndex as number) : internalIndex,
    tabs.length,
  );

  const activeGestureId = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const dragDeltaY = useRef(0);

  useEffect(() => {
    gestureManager.ensureListeners();
  }, []);

  useEffect(() => {
    if (tabs.length === 0) {
      return;
    }
    if (!isControlled) {
      setInternalIndex((prev) => clampIndex(prev, tabs.length));
    }
  }, [isControlled, tabs.length]);

  const commitIndex = useCallback(
    (nextIndex: number) => {
      const normalizedNext = clampIndex(nextIndex, tabs.length);
      const prev = resolvedActiveIndex;
      if (normalizedNext === prev) {
        return;
      }
      const allowed = onChange?.(normalizedNext, prev);
      if (allowed === false) {
        return;
      }
      if (!isControlled) {
        setInternalIndex(normalizedNext);
      }
      onAfterChange?.(normalizedNext);
    },
    [isControlled, onAfterChange, onChange, resolvedActiveIndex, tabs.length],
  );

  const onPanelStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!swipable || tabs.length < 2) {
        return;
      }
      const point = getClientPoint(event);
      if (!point) {
        return;
      }
      const id = globalGestureId++;
      activeGestureId.current = id;
      dragDeltaX.current = 0;
      dragDeltaY.current = 0;
      gestureManager.start({
        id,
        layer,
        startX: point.x,
        startY: point.y,
        currentX: point.x,
        currentY: point.y,
        onMove: (dx, dy) => {
          dragDeltaX.current = dx;
          dragDeltaY.current = dy;
          onSwipe?.();
        },
        onEnd: (dx, dy) => {
          activeGestureId.current = null;
          const horizontalDistance = Math.abs(dx);
          const verticalDistance = Math.abs(dy);
          if (Math.max(horizontalDistance, verticalDistance) < 28) {
            return;
          }
          const isHorizontal = horizontalDistance >= verticalDistance;
          if (!isHorizontal) {
            if (dy > 0) {
              commitIndex(resolvedActiveIndex - 1);
            } else {
              commitIndex(resolvedActiveIndex + 1);
            }
            return;
          }
          if (dx > 0) {
            commitIndex(resolvedActiveIndex - 1);
          } else {
            commitIndex(resolvedActiveIndex + 1);
          }
        },
      });
    },
    [commitIndex, layer, onSwipe, resolvedActiveIndex, swipable, tabs.length],
  );

  const onPanelEnd = useCallback(() => {
    if (activeGestureId.current === null) {
      return;
    }
    gestureManager.maybeEnd(activeGestureId.current);
    activeGestureId.current = null;
  }, []);

  const contextValue = useMemo<ReactAppTabsContextType>(
    () => ({
      layer,
      activeIndex: resolvedActiveIndex,
      getConfig: () => tabs[resolvedActiveIndex],
      getPrevLayer: () => parent,
    }),
    [layer, parent, resolvedActiveIndex, tabs],
  );

  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: getRootFlexDirection(direction),
    width: '100%',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
  };

  const panelStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  };

  const barStyle: CSSProperties = {
    display: 'flex',
    flexDirection: getBarFlexDirection(direction),
    ...(TabBarStyle ?? {}),
  };

  const shouldBarBeforePanel = direction === 'top' || direction === 'left';

  return (
    <TabsContext.Provider value={contextValue}>
      <div style={rootStyle}>
        {shouldBarBeforePanel ? (
          <div className={TabBarClassName} style={barStyle}>
            {tabs.map((tab, index) => {
              const key = keyExtractor(tab);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => commitIndex(index)}
                  style={{
                    flex: fit === 'container' ? 1 : undefined,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {TabBarRenderer(tab)}
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          style={panelStyle}
          onMouseDown={onPanelStart}
          onTouchStart={onPanelStart}
          onMouseUp={onPanelEnd}
          onTouchEnd={onPanelEnd}
          onTouchCancel={onPanelEnd}
        >
          {tabs.map((tab, index) => {
            const key = keyExtractor(tab);
            const visible = Math.abs(index - resolvedActiveIndex) <= lazyLoadDistance;
            if (!visible) {
              return null;
            }
            return (
              <div
                key={key}
                style={{
                  display: index === resolvedActiveIndex ? 'block' : 'none',
                  width: '100%',
                  height: '100%',
                }}
              >
                {TabPanelRenderer(tab)}
              </div>
            );
          })}
        </div>

        {!shouldBarBeforePanel ? (
          <div className={TabBarClassName} style={barStyle}>
            {tabs.map((tab, index) => {
              const key = keyExtractor(tab);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => commitIndex(index)}
                  style={{
                    flex: fit === 'container' ? 1 : undefined,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {TabBarRenderer(tab)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </TabsContext.Provider>
  );
}
