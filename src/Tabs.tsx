import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TabsContext, useReactAppTabsContext } from './context';
import { gestureManager } from './gesture-manager';
import styles from './index.module.css';
import type {
  InternalTabsContextType,
  TabBarRenderItem,
  TabsProps,
  TabsWithCustomBarProps,
  TabsWithDefaultBarProps,
} from './types';
import { clampIndex, getBarFlexDirection, getRootFlexDirection, joinClassNames } from './utils';

let globalGestureId = 1;

export { useReactAppTabsContext };

export function Tabs<T>(props: TabsProps<T>) {
  const {
    __test_name,
    tabs,
    keyExtractor,
    TabPanelRenderer,
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

      const id = globalGestureId++;
      activeGestureId.current = id;

      gestureManager.registerCandidate(event, {
        id,
        name: __test_name ?? `Tab(layer:${layer})`,
        layer,
        canHandle: (dx, dy) => {
          if (Math.abs(dx) < Math.abs(dy)) {
            return { accept: false, reason: '纵向位移更大' };
          }
          if (dx > 0) {
            if (currentIndex > 0) {
              return { accept: true, reason: '可向前切换' };
            }
            return { accept: false, reason: '已在首项' };
          }
          if (dx < 0) {
            if (currentIndex < tabs.length - 1) {
              return { accept: true, reason: '可向后切换' };
            }
            return { accept: false, reason: '已在末项' };
          }
          return { accept: true, reason: '等待方向确认' };
        },
        onStart: () => {
          pendingAfterChangeIndex.current = null;
          setIsAnimating(false);
          setDragOffset(0);
          setPreviewBarIndex(currentIndex);
        },
        onMove: (dx, dy) => {
          onSwipe?.();
          const previewMode = previewSwipe(dx);
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
            if (!commitIndex(currentIndex - 1)) {
              startAnimation(currentIndex, false);
            }
            return;
          }
          if (dx < -threshold) {
            if (!commitIndex(currentIndex + 1)) {
              startAnimation(currentIndex, false);
            }
            return;
          }
          startAnimation(currentIndex, false);
        },
      });
    },
    [
      commitIndex,
      currentIndex,
      layer,
      onSwipe,
      previewSwipe,
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
  }, []);

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
    ...(('TabBarStyle' in props ? props.TabBarStyle : undefined) ?? {}),
  };

  const panelTrackStyle: CSSProperties = {
    width: `${tabs.length * 100}%`,
    transform: `translate3d(calc(${-currentIndex * (100 / Math.max(tabs.length, 1))}% + ${dragOffset}px), 0, 0)`,
    transition: isAnimating ? `transform ${duration}ms ease` : undefined,
  };

  const effectiveLazyDistance = Math.max(lazyLoadDistance, 1);
  const customBarRenderer =
    typeof (props as TabsWithCustomBarProps<T>).TabBarRenderer === 'function'
      ? (props as TabsWithCustomBarProps<T>).TabBarRenderer
      : undefined;
  const defaultBarProps = props as TabsWithDefaultBarProps<T>;
  const tabBarItems: TabBarRenderItem<T>[] = tabs.map((tab, index) => ({
    tab,
    key: keyExtractor(tab),
    index,
    active: index === currentIndex,
    onClick: () => {
      commitIndex(index);
    },
  }));

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={styles.root} style={rootStyle}>
        {customBarRenderer ? (
          customBarRenderer({
            items: tabBarItems,
            activeIndex: currentIndex,
            direction,
            fit,
          })
        ) : (
          <div
            className={joinClassNames(styles.tabBar, defaultBarProps.TabBarClassName)}
            style={barStyle}
          >
            {tabBarItems.map((item) => (
              <React.Fragment key={item.key}>
                {defaultBarProps.TabBarItemRenderer(item.tab, {
                  onClick: item.onClick,
                  active: item.active,
                  index: item.index,
                })}
              </React.Fragment>
            ))}
          </div>
        )}

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
