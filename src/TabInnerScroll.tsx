import React, {
  CSSProperties,
  ElementType,
  ForwardedRef,
  ReactElement,
  Ref,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { TabsContext } from "./context";
import { gestureManager } from "./gesture-manager";

type TabInnerScrollOwnProps = {
  __test_name?: string;
  direction?: "vertical" | "horizontal";
  /** 用于关闭对外接管。这下你不能从元素内滑动到外面了 */
  stopPropagation?: boolean;
};

export type TabInnerScrollProps<T extends ElementType = "div"> =
  TabInnerScrollOwnProps & {
    as?: T;
  } & Omit<
      React.ComponentPropsWithoutRef<T>,
      keyof TabInnerScrollOwnProps | "as"
    >;

type TabInnerScrollComponent = <T extends ElementType = "div">(
  props: TabInnerScrollProps<T> & {
    ref?: React.ComponentPropsWithRef<T>["ref"];
  },
) => ReactElement | null;

type TabInnerScrollComponentWithMeta = TabInnerScrollComponent & {
  displayName?: string;
};

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as React.MutableRefObject<T | null>).current = value;
}

function TabInnerScrollInner<T extends ElementType = "div">(
  props: TabInnerScrollProps<T>,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const {
    as,
    __test_name,
    direction = "vertical",
    style,
    stopPropagation,
    ...rest
  } = props;
  const Component = (as ?? "div") as ElementType;
  const context = useContext(TabsContext);
  const ref = useRef<HTMLElement | null>(null);
  const rawId = useId();
  const id = useMemo(() => rawId.replace(/:/g, "_"), [rawId]);

  useEffect(() => {
    if (!context) {
      return;
    }
    gestureManager.registerInnerScroll({
      id,
      name: __test_name ?? `InnerScroll_${id}`,
      layer: context.layer,
      getElement: () => ref.current,
      shouldAllowParentSwipe(dx, dy) {
        if (stopPropagation) return false;
        const element = ref.current;
        if (!element) {
          return true;
        }

        if (direction === "horizontal") {
          if (Math.abs(dx) < Math.abs(dy)) {
            return true;
          }
          const maxScrollLeft = Math.max(
            0,
            element.scrollWidth - element.clientWidth,
          );
          if (maxScrollLeft <= 0) {
            return true;
          }
          if (dx > 0) {
            return element.scrollLeft <= 0;
          }
          if (dx < 0) {
            return element.scrollLeft >= maxScrollLeft - 1;
          }
          return true;
        }

        if (Math.abs(dy) < Math.abs(dx)) {
          return true;
        }
        const maxScrollTop = Math.max(
          0,
          element.scrollHeight - element.clientHeight,
        );
        if (maxScrollTop <= 0) {
          return true;
        }
        if (dy > 0) {
          return element.scrollTop <= 0;
        }
        if (dy < 0) {
          return element.scrollTop >= maxScrollTop - 1;
        }
        return true;
      },
    });
    return () => {
      gestureManager.unregisterInnerScroll(id);
    };
  }, [__test_name, context, direction, id, stopPropagation]);

  if (!context) {
    return (
      <Component
        ref={(node: unknown) => {
          ref.current = node as HTMLElement | null;
          setRef(forwardedRef, node as HTMLElement | null);
        }}
        {...(rest as object)}
        style={style}
      />
    );
  }

  const managedStyle: CSSProperties =
    direction === "horizontal"
      ? {
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          ...style,
        }
      : {
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          ...style,
        };
  return (
    <Component
      ref={(node: unknown) => {
        ref.current = node as HTMLElement | null;
        setRef(forwardedRef, node as HTMLElement | null);
      }}
      data-tab-inner-scroll-id={id}
      {...(rest as object)}
      style={managedStyle}
    />
  );
}

export const TabInnerScroll = forwardRef(
  TabInnerScrollInner as never,
) as unknown as TabInnerScrollComponentWithMeta;
TabInnerScroll.displayName = "TabInnerScroll";
