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
import { useDebounceFn } from "./hooks";
import {
  clampIndex,
  getBarFlexDirection,
  getRootFlexDirection,
  joinClassNames,
} from "./utils";

type SnapTabsProps<T> = TabsProps<T> & {
  snapStop?: boolean;
  clickAnimate?: boolean;
};

function SnapTabsInner<T>(
  props: SnapTabsProps<T>,
  ref: React.ForwardedRef<TabsRef>,
) {
  const {
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
    fit = "container",
    direction = "bottom",
    lazyLoadDistance = 3,
    snapStop = false,
    clickAnimate = false,
    TabBarRenderer,
    TabBarStyle = {},
  } = props;

  const isControlled = activeIndex !== undefined;
  const isHorizontal = direction === "top" || direction === "bottom";

  const [currentIndex, setCurrentIndex] = useState(() =>
    clampIndex(activeIndex ?? defaultIndex, tabs.length),
  );

  const panelContainerRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const settledIndexRef = useRef(currentIndex);
  const tabBarCallbackRef = useRef<{
    onSwipe?: (progress: number) => void;
    onChange?: (activeIndex: number) => void;
  }>({});

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const getScrollPos = useCallback(() => {
    const el = panelContainerRef.current;
    if (!el) {
      return 0;
    }
    return isHorizontal ? el.scrollLeft : el.scrollTop;
  }, [isHorizontal]);

  const getPanelSize = useCallback(() => {
    const el = panelContainerRef.current;
    if (!el) return 0;
    return isHorizontal ? el.clientWidth : el.clientHeight;
  }, [isHorizontal]);

  const getPanelOffset = useCallback(
    (index: number) => {
      const el = panelContainerRef.current;
      if (!el) return 0;
      const panel = el.children[index] as HTMLElement | undefined;
      if (!panel) return 0;
      return isHorizontal ? panel.offsetLeft : panel.offsetTop;
    },
    [isHorizontal],
  );

  const scrollToIndex = useCallback(
    (index: number, animate = clickAnimate) => {
      const el = panelContainerRef.current;
      if (!el) return;
      const target = getPanelOffset(index);
      const dir = isHorizontal ? "left" : "top";
      const behavior: ScrollBehavior = animate ? "smooth" : "instant";
      el.scrollTo({ [dir]: target, behavior });
    },
    [clickAnimate, getPanelOffset, isHorizontal],
  );

  const getScrollProgress = useCallback(() => {
    const size = getPanelSize();
    if (size <= 0 || tabs.length <= 1) {
      return currentIndexRef.current;
    }
    const raw = getScrollPos() / size;
    return Math.min(tabs.length - 1, Math.max(0, raw));
  }, [getPanelSize, getScrollPos, tabs.length]);

  const applyActiveIndex = useCallback(
    (nextIndex: number, prevIndex: number) => {
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      tabBarCallbackRef.current.onChange?.(nextIndex);
      onChange?.(nextIndex, prevIndex);
    },
    [onChange],
  );

  const handleScrollSettled = useCallback(() => {
    const next = clampIndex(Math.round(getScrollProgress()), tabs.length);
    if (next !== settledIndexRef.current) {
      settledIndexRef.current = next;
      onAfterChange?.(next);
    }
  }, [getScrollProgress, onAfterChange, tabs.length]);
  const settleDebounced = useDebounceFn(handleScrollSettled, { wait: 90 });

  const handlePanelScroll = useCallback(() => {
    const progress = getScrollProgress();
    tabBarCallbackRef.current.onSwipe?.(progress);
    onSwipe?.(progress);

    const next = clampIndex(Math.round(progress), tabs.length);
    const prev = currentIndexRef.current;
    if (next !== prev) {
      const allowed = onChange?.(next, prev);
      if (allowed === false) {
        scrollToIndex(prev, false);
      } else {
        currentIndexRef.current = next;
        setCurrentIndex(next);
        tabBarCallbackRef.current.onChange?.(next);
      }
    }

    settleDebounced.run();
  }, [
    getScrollProgress,
    onChange,
    onSwipe,
    scrollToIndex,
    settleDebounced,
    tabs.length,
  ]);

  const commitIndex = useCallback(
    (nextIndex: number) => {
      const normalizedNext = clampIndex(nextIndex, tabs.length);
      const prevIndex = currentIndexRef.current;
      if (normalizedNext === prevIndex) {
        return false;
      }
      const allowed = onChange?.(normalizedNext, prevIndex);
      if (allowed === false) {
        scrollToIndex(prevIndex, false);
        return false;
      }
      currentIndexRef.current = normalizedNext;
      setCurrentIndex(normalizedNext);
      tabBarCallbackRef.current.onChange?.(normalizedNext);
      scrollToIndex(normalizedNext, clickAnimate);
      settleDebounced.run();
      return true;
    },
    [clickAnimate, onChange, scrollToIndex, settleDebounced, tabs.length],
  );

  useEffect(() => {
    if (tabs.length === 0) {
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      settledIndexRef.current = 0;
      return;
    }
    if (!isControlled) {
      return;
    }
    const next = clampIndex(activeIndex as number, tabs.length);
    const prev = currentIndexRef.current;
    if (next !== prev) {
      applyActiveIndex(next, prev);
    }
    scrollToIndex(next, clickAnimate);
  }, [activeIndex, applyActiveIndex, isControlled, scrollToIndex, tabs.length]);

  useLayoutEffect(() => {
    scrollToIndex(currentIndexRef.current, false);
  }, [direction, fit, scrollToIndex, tabs.length]);

  useEffect(
    () => () => {
      settleDebounced.cancel();
    },
    [settleDebounced],
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
      scrollSnapStop: snapStop ? "always" : "normal",
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
  }, [TabBarStyle, direction, fit, isHorizontal, snapStop]);

  const effectiveLazyDistance = Math.max(lazyLoadDistance, 1);
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
        commitIndex(nextIndex);
      },
    }),
    [commitIndex],
  );

  return (
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
          duration: 0,
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
  props: SnapTabsProps<T> & { ref?: React.Ref<TabsRef> },
) => React.ReactElement;
