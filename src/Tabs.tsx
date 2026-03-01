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
import styles from './index.module.css';

export type Key = string | number;

export type TabItem<T> = T;

export type TabsProps<T> = {
  tabs: TabItem<T>[];
  keyExtractor: (tab: TabItem<T>) => Key;
  TabBarItemRenderer: (tab: TabItem<T>) => ReactNode;
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
  duration?: number;
};

export type ReactAppTabsContextType = {
  layer: number;
  activeIndex: number;
  getConfig: () => TabItem<any> | undefined;
  getPrevLayer: () => ReactAppTabsContextType | undefined;
};

type InternalTabsContextType = ReactAppTabsContextType & {
  requestSwipe: (step: -1 | 1) => boolean;
  previewSwipe: (dx: number) => 'self' | 'parent' | 'none';
  clearPreview: () => void;
};

const TabsContext = createContext<InternalTabsContextType | undefined>(undefined);

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
  if (direction === 'top') {
    return 'column';
  }
  if (direction === 'bottom') {
    return 'column-reverse';
  }
  if (direction === 'left') {
    return 'row';
  }
  return 'row-reverse';
}

function joinClassNames(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
}

export function useReactAppTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    return undefined;
  }
  const {
    requestSwipe: _requestSwipe,
    previewSwipe: _previewSwipe,
    clearPreview: _clearPreview,
    ...publicContext
  } = context;
  return publicContext;
}

export function Tabs<T>(props: TabsProps<T>) {
  const {
    tabs,
    keyExtractor,
    TabBarItemRenderer,
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
    duration = 300,
  } = props;

  const parent = useContext(TabsContext);
  const layer = (parent?.layer ?? -1) + 1;
  const isControlled = activeIndex !== undefined;

  const [internalIndex, setInternalIndex] = useState(() => clampIndex(defaultIndex, tabs.length));
  const [currentIndex, setCurrentIndex] = useState(() =>
    clampIndex(activeIndex ?? defaultIndex, tabs.length),
  );
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [, setPreviewBarIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeGestureId = useRef<number | null>(null);
  const pendingAfterChangeIndex = useRef<number | null>(null);

  useEffect(() => {
    gestureManager.ensureListeners();
  }, []);

  useEffect(() => {
    if (tabs.length === 0) {
      setCurrentIndex(0);
      setInternalIndex(0);
      return;
    }

    if (isControlled) {
      const next = clampIndex(activeIndex as number, tabs.length);
      setCurrentIndex(next);
      setDragOffset(0);
      setPreviewBarIndex(null);
      return;
    }

    setInternalIndex((prev) => {
      const next = clampIndex(prev, tabs.length);
      setCurrentIndex(next);
      return next;
    });
    setDragOffset(0);
    setPreviewBarIndex(null);
  }, [activeIndex, isControlled, tabs.length]);

  const startAnimation = useCallback(
    (targetIndex: number, shouldTriggerAfterChange: boolean) => {
      setDragOffset(0);
      setPreviewBarIndex(null);
      setCurrentIndex(targetIndex);
      if (duration <= 0) {
        setIsAnimating(false);
        if (shouldTriggerAfterChange) {
          onAfterChange?.(targetIndex);
        }
        return;
      }
      pendingAfterChangeIndex.current = shouldTriggerAfterChange ? targetIndex : null;
      setIsAnimating(true);
    },
    [duration, onAfterChange],
  );

  const commitIndex = useCallback(
    (nextIndex: number) => {
      const normalizedNext = clampIndex(nextIndex, tabs.length);
      const prev = currentIndex;
      if (normalizedNext === prev) {
        startAnimation(prev, false);
        return false;
      }

      const allowed = onChange?.(normalizedNext, prev);
      if (allowed === false) {
        startAnimation(prev, false);
        return false;
      }

      if (!isControlled) {
        setInternalIndex(normalizedNext);
      }
      startAnimation(normalizedNext, true);
      return true;
    },
    [currentIndex, isControlled, onChange, startAnimation, tabs.length],
  );

  const requestSwipe = useCallback(
    (step: -1 | 1) => {
      const target = currentIndex + step;
      if (target >= 0 && target < tabs.length) {
        return commitIndex(target);
      }
      return parent?.requestSwipe?.(step) ?? false;
    },
    [commitIndex, currentIndex, parent, tabs.length],
  );

  const clearPreview = useCallback(() => {
    setDragOffset(0);
    setPreviewBarIndex(null);
    parent?.clearPreview?.();
  }, [parent]);

  const previewSwipe = useCallback(
    (dx: number) => {
      const canGoPrev = currentIndex > 0;
      const canGoNext = currentIndex < tabs.length - 1;

      if ((dx > 0 && !canGoPrev) || (dx < 0 && !canGoNext)) {
        const parentPreview = parent?.previewSwipe?.(dx) ?? 'none';
        return parentPreview === 'none' ? 'none' : 'parent';
      }

      setIsAnimating(false);
      setDragOffset(dx);
      if (dx > 16) {
        setPreviewBarIndex(currentIndex - 1);
      } else if (dx < -16) {
        setPreviewBarIndex(currentIndex + 1);
      } else {
        setPreviewBarIndex(currentIndex);
      }
      return 'self';
    },
    [currentIndex, parent, tabs.length],
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
      pendingAfterChangeIndex.current = null;
      setIsAnimating(false);
      setDragOffset(0);
      setPreviewBarIndex(currentIndex);

      gestureManager.start({
        id,
        layer,
        startX: point.x,
        startY: point.y,
        currentX: point.x,
        currentY: point.y,
        onMove: (dx) => {
          onSwipe?.();
          const previewMode = previewSwipe(dx);
          if (previewMode === 'parent') {
            setDragOffset(0);
            setPreviewBarIndex(null);
            return;
          }
          if (previewMode === 'self') {
            return;
          }
          setIsAnimating(false);
          setDragOffset(dx * 0.35);
          setPreviewBarIndex(currentIndex);
        },
        onEnd: (dx) => {
          activeGestureId.current = null;
          const containerWidth = containerRef.current?.clientWidth ?? 0;
          const threshold = Math.max(28, containerWidth * 0.2);

          if (dx > threshold) {
            if (!requestSwipe(-1)) {
              startAnimation(currentIndex, false);
            }
            parent?.clearPreview?.();
            return;
          }
          if (dx < -threshold) {
            if (!requestSwipe(1)) {
              startAnimation(currentIndex, false);
            }
            parent?.clearPreview?.();
            return;
          }
          parent?.clearPreview?.();
          startAnimation(currentIndex, false);
        },
      });
    },
    [
      currentIndex,
      layer,
      onSwipe,
      parent,
      previewSwipe,
      requestSwipe,
      startAnimation,
      swipable,
      tabs.length,
    ],
  );

  const onPanelEnd = useCallback(() => {
    if (activeGestureId.current === null) {
      return;
    }
    gestureManager.maybeEnd(activeGestureId.current);
    activeGestureId.current = null;
    parent?.clearPreview?.();
  }, [parent]);

  const onTrackTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== 'transform') {
        return;
      }
      setIsAnimating(false);
      const pending = pendingAfterChangeIndex.current;
      pendingAfterChangeIndex.current = null;
      if (pending !== null) {
        onAfterChange?.(pending);
      }
    },
    [onAfterChange],
  );

  const contextValue = useMemo<InternalTabsContextType>(
    () => ({
      layer,
      activeIndex: currentIndex,
      getConfig: () => tabs[currentIndex],
      getPrevLayer: () => parent,
      requestSwipe,
      previewSwipe,
      clearPreview,
    }),
    [clearPreview, currentIndex, layer, parent, previewSwipe, requestSwipe, tabs],
  );

  const rootStyle: CSSProperties = {
    flexDirection: getRootFlexDirection(direction),
  };

  const barStyle: CSSProperties = {
    flexDirection: getBarFlexDirection(direction),
    ...(TabBarStyle ?? {}),
  };

  const panelTrackStyle: CSSProperties = {
    width: `${tabs.length * 100}%`,
    transform: `translate3d(calc(${-currentIndex * (100 / Math.max(tabs.length, 1))}% + ${dragOffset}px), 0, 0)`,
    transition: isAnimating ? `transform ${duration}ms ease` : undefined,
  };

  const effectiveLazyDistance = Math.max(lazyLoadDistance, 1);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={styles.root} style={rootStyle}>
        <div className={joinClassNames(styles.tabBar, TabBarClassName)} style={barStyle}>
          {tabs.map((tab, index) => {
            const key = keyExtractor(tab);
            return (
              <button
                key={key}
                type="button"
                onClick={() => commitIndex(index)}
                className={styles.tabButton}
                style={{
                  flex: fit === 'container' ? 1 : undefined,
                }}
              >
                {TabBarItemRenderer(tab)}
              </button>
            );
          })}
        </div>

        <div
          ref={containerRef}
          className={styles.panelContainer}
          onMouseDown={onPanelStart}
          onTouchStart={onPanelStart}
          onMouseUp={onPanelEnd}
          onTouchEnd={onPanelEnd}
          onTouchCancel={onPanelEnd}
        >
          <div
            className={styles.panelTrack}
            style={panelTrackStyle}
            onTransitionEnd={onTrackTransitionEnd}
          >
            {tabs.map((tab, index) => {
              const key = keyExtractor(tab);
              const visible = Math.abs(index - currentIndex) <= effectiveLazyDistance;
              return (
                <div
                  key={key}
                  className={styles.panelItem}
                  style={{
                    width: `${100 / Math.max(tabs.length, 1)}%`,
                    flex: `0 0 ${100 / Math.max(tabs.length, 1)}%`,
                  }}
                >
                  {visible ? TabPanelRenderer(tab) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TabsContext.Provider>
  );
}
