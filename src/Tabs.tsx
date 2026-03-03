import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
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
    className,
    style,
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
    TabBarStyle = {}
  } = props;

  const parent = useContext(TabsContext);
  const layer = (parent?.layer ?? -1) + 1;
  const isControlled = activeIndex !== undefined;
  const isHorizontalSwipe = direction === "top" || direction === "bottom";

  const [currentIndex, setCurrentIndex] = useState(() =>
    clampIndex(activeIndex ?? defaultIndex, tabs.length),
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelTrackRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef(0);
  const activeGestureId = useRef<number | null>(null);
  const pendingAfterChangeIndex = useRef<number | null>(null);
  const movedOnceRef = useRef(false);
  const repickSentRef = useRef(false);
  const animationDurationRef = useRef(duration);
  const tabBarCallbackRef = useRef<{
    onSwipe?: (progress: number) => void;
    onChange?: (activeIndex: number) => void;
  }>({});

  const applyTrackTransform = useCallback(
    (offsetPx: number, transitionDurationMs: number) => {
      const track = panelTrackRef.current;
      if (!track) {
        return;
      }
      track.style.transition =
        transitionDurationMs > 0
          ? `transform ${transitionDurationMs}ms ease`
          : "none";
      track.style.transform = isHorizontalSwipe
        ? `translate3d(calc(${-currentIndex * 100}% + ${offsetPx}px), 0, 0)`
        : `translate3d(0, calc(${-currentIndex * 100}% + ${offsetPx}px), 0)`;
    },
    [currentIndex, isHorizontalSwipe],
  );

  useEffect(() => {
    gestureManager.ensureListeners();
  }, []);

  useEffect(() => {
    if (tabs.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (isControlled) {
      const next = clampIndex(activeIndex as number, tabs.length);
      setCurrentIndex(next);
      dragOffsetRef.current = 0;
      return;
    }

    dragOffsetRef.current = 0;
  }, [activeIndex, isControlled, tabs.length]);

  const startAnimation = useCallback(
    (
      targetIndex: number,
      shouldTriggerAfterChange: boolean,
      transitionDuration: number,
    ) => {
      dragOffsetRef.current = 0;
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
      const transitionDuration =
        trigger === "switch" ? switchDuration : duration;
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
    dragOffsetRef.current = 0;
    applyTrackTransform(0, 0);
    parent?.clearPreview?.();
  }, [applyTrackTransform, parent]);

  const previewSwipe = useCallback(
    (mainDelta: number) => {
      setIsAnimating(false);
      dragOffsetRef.current = mainDelta;
      applyTrackTransform(mainDelta, 0);
      const containerSize = isHorizontalSwipe
        ? containerRef.current?.clientWidth ?? 0
        : containerRef.current?.clientHeight ?? 0;
      const rawProgress =
        containerSize > 0
          ? currentIndex - mainDelta / containerSize
          : currentIndex;
      const nextProgress = Math.min(tabs.length - 1, Math.max(0, rawProgress));
      tabBarCallbackRef.current.onSwipe?.(nextProgress);
      onSwipe?.(nextProgress);
      return "self";
    },
    [
      applyTrackTransform,
      currentIndex,
      isHorizontalSwipe,
      onSwipe,
      parent,
      tabs.length,
    ],
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
        axis: isHorizontalSwipe ? "horizontal" : "vertical",
        preventScrollChain: true,
        canHandle: (dx, dy) => {
          const mainDelta = isHorizontalSwipe ? dx : dy;
          const crossDelta = isHorizontalSwipe ? dy : dx;
          if (Math.abs(mainDelta) < Math.abs(crossDelta)) {
            return {
              accept: false,
              reason: isHorizontalSwipe
                ? "纵向位移更大"
                : "横向位移更大",
            };
          }
          if (mainDelta > 0) {
            if (currentIndex > 0) {
              return { accept: true, reason: "可向前切换" };
            }
            return { accept: false, reason: "已在首项" };
          }
          if (mainDelta < 0) {
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
          dragOffsetRef.current = 0;
          applyTrackTransform(0, 0);
          movedOnceRef.current = false;
          repickSentRef.current = false;
        },
        onMove: (dx, dy, requestRepick) => {
          const mainDelta = isHorizontalSwipe ? dx : dy;
          if (Math.abs(mainDelta) > 12) {
            movedOnceRef.current = true;
          }
          if (
            !repickSentRef.current &&
            movedOnceRef.current &&
            Math.abs(mainDelta) <= 4
          ) {
            repickSentRef.current = true;
            requestRepick();
          }
          const previewMode = previewSwipe(mainDelta);
          if (previewMode === "self") {
            return;
          }
          setIsAnimating(false);
          dragOffsetRef.current = mainDelta * 0.35;
          applyTrackTransform(mainDelta * 0.35, 0);
        },
        onEnd: (dx, dy, dvx, dvy) => {
          activeGestureId.current = null;
          const shouldNotifySettle = movedOnceRef.current;
          movedOnceRef.current = false;
          repickSentRef.current = false;
          const mainDelta = isHorizontalSwipe ? dx : dy;
          const mainVelocity = isHorizontalSwipe ? dvx : dvy;
          const containerSize = isHorizontalSwipe
            ? containerRef.current?.clientWidth ?? 0
            : containerRef.current?.clientHeight ?? 0;
          const threshold = Math.max(28, containerSize * 0.2);
          const mixedDelta = mainDelta + (mainVelocity * 400);
          if (mixedDelta > threshold) {
            if (!commitIndex(currentIndex - 1, "swipe")) {
              startAnimation(currentIndex, shouldNotifySettle, duration);
            }
            return;
          }
          if (mixedDelta < -threshold) {
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
      applyTrackTransform,
      isHorizontalSwipe,
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

  const calcStyle = useMemo(() => {
    const isVertical = direction === "top" || direction === "bottom";
    const fixedDir = isVertical ? "width" : "height";
    const flexDir = isVertical ? "height" : "width";
    const fitContainer =
      fit === "container"
        ? { [fixedDir]: "100%", [flexDir]: "100%" }
        : { [fixedDir]: "100%" };

    const panelContainerStyle =
      fit === "container"
        ? { flex: 1, minWidth: 0, minHeight: 0, ...fitContainer }
        : { [fixedDir]: "100%" };

    const barStyle = { flexDirection: getBarFlexDirection(direction), ...TabBarStyle };
    const rootStyle = { flexDirection: getRootFlexDirection(direction), ...fitContainer, };
    const panelItemStyle = { ...fitContainer, flex: fit === "container" ? "0 0 100%" : "0 0 auto", };
    const panelTrackStyle = { ...fitContainer, flexDirection: isHorizontalSwipe ? "row" : "column", };
    return {
      root: rootStyle as CSSProperties,
      panels: panelContainerStyle as CSSProperties,
      bar: barStyle as CSSProperties,
      panel: panelTrackStyle as CSSProperties,
      panelItem: panelItemStyle as CSSProperties,
    };
  }, [fit, direction, isHorizontalSwipe]);

  useLayoutEffect(() => {
    applyTrackTransform(
      dragOffsetRef.current,
      isAnimating ? animationDurationRef.current : 0,
    );
  }, [applyTrackTransform, currentIndex, isAnimating]);

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
        className={joinClassNames(styles.root, className)}
        style={{ ...calcStyle.root, ...style }}
      >
        {TabBarRenderer ? (
          TabBarRenderer({
            items: tabBarItems,
            activeIndex: currentIndex,
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
            style={calcStyle.bar}
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
          style={calcStyle.panels}
          onMouseDown={onPanelStart}
          onTouchStart={onPanelStart}
          onMouseUp={onPanelEnd}
          onTouchEnd={onPanelEnd}
          onTouchCancel={onPanelEnd}
        >
          <div
            ref={panelTrackRef}
            className={styles.panelTrack}
            style={calcStyle.panel}
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
                  style={calcStyle.panelItem}
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
