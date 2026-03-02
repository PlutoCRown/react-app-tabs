import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { TabsContext, useReactAppTabsContext } from "./context";
import { gestureManager } from "./gesture-manager";
import styles from "./index.module.css";
import type {
  InternalTabsContextType,
  TabBarRenderItem,
  TabsProps,
  TabsRef,
  TabsWithDefaultBarProps,
} from "./types";
import {
  clampIndex,
  getBarFlexDirection,
  getRootFlexDirection,
  joinClassNames,
} from "./utils";

let globalGestureId = 1;

export { useReactAppTabsContext };

function TabsInner<T>(props: TabsProps<T>, ref: React.ForwardedRef<TabsRef>) {
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
    fit = "container",
    direction = "bottom",
    lazyLoadDistance = 3,
    duration = 300,
    switchDuration = 0,
    TabBarRenderer,
  } = props;

  const parent = useContext(TabsContext);
  const layer = (parent?.layer ?? -1) + 1;
  const isControlled = activeIndex !== undefined;

  const [internalIndex, setInternalIndex] = useState(() =>
    clampIndex(defaultIndex, tabs.length),
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    clampIndex(activeIndex ?? defaultIndex, tabs.length),
  );
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [, setPreviewBarIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeGestureId = useRef<number | null>(null);
  const pendingAfterChangeIndex = useRef<number | null>(null);
  const movedOnceRef = useRef(false);
  const repickSentRef = useRef(false);
  const animationDurationRef = useRef(duration);
  const tabBarCallbackRef = useRef<{
    onSwipe?: (progress: number) => void;
    onChange?: (activeIndex: number) => void;
  }>({});

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
    (
      targetIndex: number,
      shouldTriggerAfterChange: boolean,
      transitionDuration: number,
    ) => {
      setDragOffset(0);
      setPreviewBarIndex(null);
      setCurrentIndex(targetIndex);
      if (transitionDuration <= 0) {
        setIsAnimating(false);
        if (shouldTriggerAfterChange) {
          onAfterChange?.(targetIndex);
        }
        return;
      }
      animationDurationRef.current = transitionDuration;
      pendingAfterChangeIndex.current = shouldTriggerAfterChange
        ? targetIndex
        : null;
      setIsAnimating(true);
    },
    [onAfterChange],
  );

  const commitIndex = useCallback(
    (nextIndex: number, trigger: "swipe" | "switch" = "swipe") => {
      const transitionDuration = trigger === "switch" ? switchDuration : duration;
      const normalizedNext = clampIndex(nextIndex, tabs.length);
      const prev = currentIndex;
      if (normalizedNext === prev) {
        startAnimation(prev, false, transitionDuration);
        return false;
      }
      // 触发 Bar 的 onChange 和 Panel 的 onChange
      tabBarCallbackRef.current.onChange?.(normalizedNext);
      const allowed = onChange?.(normalizedNext, prev);
      if (allowed === false) {
        startAnimation(prev, false, transitionDuration);
        return false;
      }

      if (!isControlled) {
        setInternalIndex(normalizedNext);
      }
      startAnimation(normalizedNext, true, transitionDuration);
      return true;
    },
    [
      currentIndex,
      duration,
      isControlled,
      onChange,
      startAnimation,
      switchDuration,
      tabs.length,
    ],
  );

  const requestSwipe = useCallback(
    (step: -1 | 1) => {
      const target = currentIndex + step;
      if (target >= 0 && target < tabs.length) {
        return commitIndex(target, "swipe");
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
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const rawProgress =
        containerWidth > 0 ? currentIndex - dx / containerWidth : currentIndex;
      const nextProgress = Math.min(tabs.length - 1, Math.max(0, rawProgress));
      tabBarCallbackRef.current.onSwipe?.(nextProgress);
      onSwipe?.(nextProgress);
      if (dx > 16) {
        setPreviewBarIndex(currentIndex - 1);
      } else if (dx < -16) {
        setPreviewBarIndex(currentIndex + 1);
      } else {
        setPreviewBarIndex(currentIndex);
      }
      return "self";
    },
    [currentIndex, onSwipe, parent, tabs.length],
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
            return { accept: false, reason: "纵向位移更大" };
          }
          if (dx > 0) {
            if (currentIndex > 0) {
              return { accept: true, reason: "可向前切换" };
            }
            return { accept: false, reason: "已在首项" };
          }
          if (dx < 0) {
            if (currentIndex < tabs.length - 1) {
              return { accept: true, reason: "可向后切换" };
            }
            return { accept: false, reason: "已在末项" };
          }
          return { accept: true, reason: "等待方向确认" };
        },
        onStart: () => {
          pendingAfterChangeIndex.current = null;
          setIsAnimating(false);
          setDragOffset(0);
          setPreviewBarIndex(currentIndex);
          movedOnceRef.current = false;
          repickSentRef.current = false;
        },
        onMove: (dx, _dy, requestRepick) => {
          if (Math.abs(dx) > 12) {
            movedOnceRef.current = true;
          }
          if (
            !repickSentRef.current &&
            movedOnceRef.current &&
            Math.abs(dx) <= 4
          ) {
            repickSentRef.current = true;
            requestRepick();
          }
          const previewMode = previewSwipe(dx);
          if (previewMode === "self") {
            return;
          }
          setIsAnimating(false);
          setDragOffset(dx * 0.35);
          setPreviewBarIndex(currentIndex);
        },
        onEnd: (dx, _dy, dvx) => {
          activeGestureId.current = null;
          const shouldNotifySettle = movedOnceRef.current;
          movedOnceRef.current = false;
          repickSentRef.current = false;
          const containerWidth = containerRef.current?.clientWidth ?? 0;
          const threshold = Math.max(28, containerWidth * 0.4);
          const mixedDx = dx + (dvx * containerWidth) / 2;
          if (mixedDx > threshold) {
            if (!commitIndex(currentIndex - 1, "swipe")) {
              startAnimation(currentIndex, shouldNotifySettle, duration);
            }
            return;
          }
          if (mixedDx < -threshold) {
            if (!commitIndex(currentIndex + 1, "swipe")) {
              startAnimation(currentIndex, shouldNotifySettle, duration);
            }
            return;
          }

          // Bar 的动画 onChange 即使和和之前的相同也要触发
          tabBarCallbackRef.current.onChange?.(currentIndex);
          startAnimation(currentIndex, shouldNotifySettle, duration);
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
      duration,
    ],
  );

  const onPanelEnd = useCallback(() => {
    if (activeGestureId.current === null) {
      return;
    }
    gestureManager.maybeEnd(activeGestureId.current);
    activeGestureId.current = null;
    movedOnceRef.current = false;
    repickSentRef.current = false;
  }, []);

  const onTrackTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform") {
        return;
      }
      setIsAnimating(false);
      const pending = pendingAfterChangeIndex.current;
      pendingAfterChangeIndex.current = null;
      if (pending !== null) {
        tabBarCallbackRef.current.onChange?.(pending);
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
    [
      clearPreview,
      currentIndex,
      layer,
      parent,
      previewSwipe,
      requestSwipe,
      tabs,
    ],
  );

  const rootStyle: CSSProperties = {
    flexDirection: getRootFlexDirection(direction),
  };
  const isTopOrBottom = direction === "top" || direction === "bottom";
  const fixedDir: "width" | "height" = isTopOrBottom ? "width" : "height";
  const flexDir: "width" | "height" = isTopOrBottom ? "height" : "width";
  const fixedSizeStyle: CSSProperties = { [fixedDir]: "100%" };
  const flexSizeStyle: CSSProperties =
    fit === "container" ? { [flexDir]: "100%" } : {};
  const panelContainerStyle: CSSProperties =
    fit === "container"
      ? {
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          ...fixedSizeStyle,
          ...flexSizeStyle,
        }
      : { ...fixedSizeStyle };

  const barStyle: CSSProperties = {
    flexDirection: getBarFlexDirection(direction),
    ...(("TabBarStyle" in props ? props.TabBarStyle : undefined) ?? {}),
  };

  const panelTrackStyle: CSSProperties = {
    ...fixedSizeStyle,
    ...flexSizeStyle,
    transform: `translate3d(calc(${-currentIndex * 100}% + ${dragOffset}px), 0, 0)`,
    transition: isAnimating
      ? `transform ${animationDurationRef.current}ms ease`
      : undefined,
  };

  const swipeProgress =
    tabs.length > 0
      ? (() => {
          const containerWidth = containerRef.current?.clientWidth ?? 0;
          const rawProgress =
            containerWidth > 0
              ? currentIndex - dragOffset / containerWidth
              : currentIndex;
          return Math.min(tabs.length - 1, Math.max(0, rawProgress));
        })()
      : 0;

  const effectiveLazyDistance = Math.max(lazyLoadDistance, 1);
  const defaultBarProps = props as TabsWithDefaultBarProps<T>;
  const tabBarItems: TabBarRenderItem<T>[] = tabs.map((tab, index) => ({
    tab,
    key: keyExtractor(tab),
    index,
    active: index === currentIndex,
    onClick: () => {
      commitIndex(index, "switch");
    },
  }));

  useImperativeHandle(
    ref,
    () => ({
      getActiveIndex: () => currentIndex,
      setActiveIndex: (nextIndex: number) => {
        commitIndex(nextIndex, "switch");
      },
    }),
    [commitIndex, currentIndex],
  );

  const tabBarCallbackApi = useMemo(
    () => ({
      onSwipe: (callback: (progress: number) => void) => {
        tabBarCallbackRef.current.onSwipe = callback;
      },
      onChange: (callback: (activeIndex: number) => void) => {
        tabBarCallbackRef.current.onChange = callback;
      },
      clear: () => {
        tabBarCallbackRef.current.onSwipe = undefined;
        tabBarCallbackRef.current.onChange = undefined;
      },
    }),
    [],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={styles.root}
        style={{ ...rootStyle, ...fixedSizeStyle, ...flexSizeStyle }}
      >
        {TabBarRenderer ? (
          TabBarRenderer({
            items: tabBarItems,
            activeIndex: currentIndex,
            swipeProgress,
            direction,
            fit,
            duration,
            callback: tabBarCallbackApi,
          })
        ) : (
          <div
            className={joinClassNames(
              styles.tabBar,
              defaultBarProps.TabBarClassName,
            )}
            style={barStyle}
          >
            {tabBarItems.map((item) => (
              <React.Fragment key={item.key}>
                {defaultBarProps.TabBarItemRenderer(item.tab, item)}
              </React.Fragment>
            ))}
          </div>
        )}

        <div
          ref={containerRef}
          className={styles.panelContainer}
          style={panelContainerStyle}
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
              const visible =
                Math.abs(index - currentIndex) <= effectiveLazyDistance;
              return (
                <div
                  key={key}
                  className={styles.panelItem}
                  style={{
                    ...fixedSizeStyle,
                    ...flexSizeStyle,
                    flex: fit === "container" ? "0 0 100%" : "0 0 auto",
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

export const Tabs = forwardRef(TabsInner) as <T>(
  props: TabsProps<T> & { ref?: React.Ref<TabsRef> },
) => React.ReactElement;
