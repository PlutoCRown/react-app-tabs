import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.css";
import type {
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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function SnapTabsInner<T>(
  props: TabsProps<T>,
  ref: React.ForwardedRef<TabsRef>,
) {
  const {
    tabs,
    keyExtractor,
    TabPanelRenderer,
    onSwipe,
    onChange,
    onAfterChange,
    defaultIndex = 0,
    activeIndex,
    fit = "container",
    direction = "bottom",
    lazyLoadDistance = 3,
    duration = 300,
    switchDuration = 0,
    TabBarRenderer,
    TabBarStyle = {},
  } = props;

  const isControlled = activeIndex !== undefined;
  const isHorizontal = direction === "top" || direction === "bottom";

  const [currentIndex, setCurrentIndex] = useState(() =>
    clampIndex(activeIndex ?? defaultIndex, tabs.length),
  );

  const panelContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const currentIndexRef = useRef(currentIndex);
  const tabBarCallbackRef = useRef<{
    onSwipe?: (progress: number) => void;
    onChange?: (activeIndex: number) => void;
  }>({});

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const clearAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  const getScrollPos = useCallback(() => {
    const el = panelContainerRef.current;
    if (!el) {
      return 0;
    }
    return isHorizontal ? el.scrollLeft : el.scrollTop;
  }, [isHorizontal]);

  const setScrollPos = useCallback(
    (value: number) => {
      const el = panelContainerRef.current;
      if (!el) {
        return;
      }
      if (isHorizontal) {
        el.scrollLeft = value;
      } else {
        el.scrollTop = value;
      }
    },
    [isHorizontal],
  );

  const getPanelOffset = useCallback(
    (index: number) => {
      const el = panelContainerRef.current;
      if (!el) {
        return 0;
      }
      const panel = el.children[index] as HTMLElement | undefined;
      if (!panel) {
        return 0;
      }
      return isHorizontal ? panel.offsetLeft : panel.offsetTop;
    },
    [isHorizontal],
  );

  const getScrollProgress = useCallback(() => {
    const el = panelContainerRef.current;
    if (!el || tabs.length <= 1) {
      return 0;
    }
    const size = isHorizontal ? el.clientWidth : el.clientHeight;
    if (size <= 0) {
      return currentIndexRef.current;
    }
    const raw = getScrollPos() / size;
    return Math.min(tabs.length - 1, Math.max(0, raw));
  }, [getScrollPos, isHorizontal, tabs.length]);

  const notifySwipe = useCallback(() => {
    const progress = getScrollProgress();
    tabBarCallbackRef.current.onSwipe?.(progress);
    onSwipe?.(progress);
  }, [getScrollProgress, onSwipe]);

  const scrollToIndex = useCallback(
    (nextIndex: number, transitionDuration: number, onSettled?: () => void) => {
      const target = getPanelOffset(nextIndex);
      clearAnimation();

      if (transitionDuration <= 0) {
        setScrollPos(target);
        onSettled?.();
        return;
      }

      const start = getScrollPos();
      const delta = target - start;
      if (Math.abs(delta) < 1) {
        setScrollPos(target);
        onSettled?.();
        return;
      }

      programmaticScrollRef.current = true;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / transitionDuration);
        const eased = easeInOutCubic(progress);
        setScrollPos(start + delta * eased);
        notifySwipe();
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
          return;
        }
        setScrollPos(target);
        programmaticScrollRef.current = false;
        animationFrameRef.current = null;
        onSettled?.();
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [clearAnimation, getPanelOffset, getScrollPos, notifySwipe, setScrollPos],
  );

  const commitIndex = useCallback(
    (nextIndex: number, trigger: "swipe" | "switch" = "swipe") => {
      const transitionDuration =
        trigger === "switch" ? switchDuration : duration;
      const normalizedNext = clampIndex(nextIndex, tabs.length);
      const prevIndex = currentIndexRef.current;

      if (normalizedNext === prevIndex) {
        return false;
      }

      const allowed = onChange?.(normalizedNext, prevIndex);
      if (allowed === false) {
        scrollToIndex(prevIndex, transitionDuration);
        return false;
      }

      tabBarCallbackRef.current.onChange?.(normalizedNext);
      if (!isControlled) {
        setCurrentIndex(normalizedNext);
      }
      currentIndexRef.current = normalizedNext;
      scrollToIndex(normalizedNext, transitionDuration, () => {
        onAfterChange?.(normalizedNext);
      });
      return true;
    },
    [
      duration,
      isControlled,
      onAfterChange,
      onChange,
      scrollToIndex,
      switchDuration,
      tabs.length,
    ],
  );

  const handleScrollSettled = useCallback(() => {
    if (programmaticScrollRef.current) {
      return;
    }
    const next = clampIndex(Math.round(getScrollProgress()), tabs.length);
    const prev = currentIndexRef.current;
    if (next === prev) {
      tabBarCallbackRef.current.onChange?.(prev);
      return;
    }
    const allowed = onChange?.(next, prev);
    if (allowed === false) {
      scrollToIndex(prev, duration);
      return;
    }
    tabBarCallbackRef.current.onChange?.(next);
    if (!isControlled) {
      setCurrentIndex(next);
    }
    currentIndexRef.current = next;
    onAfterChange?.(next);
  }, [
    duration,
    getScrollProgress,
    isControlled,
    onAfterChange,
    onChange,
    scrollToIndex,
    tabs.length,
  ]);

  const handlePanelScroll = useCallback(() => {
    notifySwipe();
    clearSettleTimer();
    settleTimerRef.current = window.setTimeout(handleScrollSettled, 90);
  }, [clearSettleTimer, handleScrollSettled, notifySwipe]);

  useEffect(() => {
    if (tabs.length === 0) {
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      return;
    }
    if (!isControlled) {
      return;
    }
    const next = clampIndex(activeIndex as number, tabs.length);
    setCurrentIndex(next);
    currentIndexRef.current = next;
    scrollToIndex(next, switchDuration);
  }, [activeIndex, isControlled, scrollToIndex, switchDuration, tabs.length]);

  useLayoutEffect(() => {
    scrollToIndex(currentIndexRef.current, 0);
  }, [direction, fit, scrollToIndex, tabs.length]);

  useEffect(
    () => () => {
      clearAnimation();
      clearSettleTimer();
    },
    [clearAnimation, clearSettleTimer],
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

    const barStyle = {
      flexDirection: getBarFlexDirection(direction),
      overflow: "auto",
      ...TabBarStyle,
    };
    const rootStyle = {
      flexDirection: getRootFlexDirection(direction),
      ...fitContainer,
    };
    const panelStyle = {
      ...fitContainer,
      scrollSnapAlign: "start",
      flex: fit === "container" ? "0 0 100%" : "0 0 auto",
      overflow: "auto",
    };
    const panelScrollStyle = {
      ...panelContainerStyle,
      display: "flex",
      flexDirection: isHorizontal ? "row" : "column",
      overflowX: isHorizontal ? "auto" : "hidden",
      overflowY: isHorizontal ? "hidden" : "auto",
      scrollSnapType: isHorizontal ? "x mandatory" : "y mandatory",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      WebkitOverflowScrolling: "touch",
      touchAction: isHorizontal ? "pan-x" : "pan-y",
    };
    return {
      root: rootStyle as CSSProperties,
      bar: barStyle as CSSProperties,
      panelScroll: panelScrollStyle as CSSProperties,
      panel: panelStyle as CSSProperties,
    };
  }, [TabBarStyle, direction, fit, isHorizontal]);

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

  useImperativeHandle(
    ref,
    () => ({
      getActiveIndex: () => currentIndexRef.current,
      setActiveIndex: (nextIndex: number) => {
        commitIndex(nextIndex, "switch");
      },
    }),
    [commitIndex],
  );

  return (
    <div className={styles.root} style={calcStyle.root}>
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
        ref={panelContainerRef}
        className={joinClassNames(
          styles.panelContainer,
          styles.snapPanelContainer,
        )}
        style={calcStyle.panelScroll}
        onScroll={handlePanelScroll}
      >
        {tabs.map((tab, index) => {
          const key = keyExtractor(tab);
          const visible =
            Math.abs(index - currentIndex) <= effectiveLazyDistance;
          return (
            <div key={key} className={styles.panelItem} style={calcStyle.panel}>
              {visible ? TabPanelRenderer(tab) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const SnapTabs = forwardRef(SnapTabsInner) as <T>(
  props: TabsProps<T> & { ref?: React.Ref<TabsRef> },
) => React.ReactElement;
