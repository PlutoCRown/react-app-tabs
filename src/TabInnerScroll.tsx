import React, { CSSProperties, HTMLAttributes, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { TabsContext } from './context';
import type { InnerScrollController } from './types';

export type TabInnerScrollProps = HTMLAttributes<HTMLDivElement> & {
  __test_name?: string;
  direction?: 'vertical' | 'horizontal';
};

export function TabInnerScroll(props: TabInnerScrollProps) {
  const { __test_name, direction = 'vertical', style, ...rest } = props;
  const context = useContext(TabsContext);
  const ref = useRef<HTMLDivElement | null>(null);
  const rawId = useId();
  const id = useMemo(() => rawId.replace(/:/g, '_'), [rawId]);

  useEffect(() => {
    if (!context) {
      return;
    }

    const controller: InnerScrollController = {
      testName: __test_name ?? `InnerScroll_${id}`,
      shouldAllowParentSwipe(dx, dy) {
        const element = ref.current;
        if (!element) {
          return true;
        }

        if (direction === 'horizontal') {
          if (Math.abs(dx) < Math.abs(dy)) {
            return true;
          }
          const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
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
        const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
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
    };

    context.registerInnerScroll(id, controller);
    return () => {
      context.unregisterInnerScroll(id);
    };
  }, [context, direction, id]);

  if (!context) {
    return <div {...rest} style={style} />;
  }

  const managedStyle: CSSProperties =
    direction === 'horizontal'
      ? {
          overflowX: 'auto',
          overflowY: 'hidden',
          touchAction: 'pan-x',
          WebkitOverflowScrolling: 'touch',
          ...style,
        }
      : {
          overflowY: 'auto',
          overflowX: 'hidden',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          ...style,
        };
  return <div ref={ref} data-tab-inner-scroll-id={id} {...rest} style={managedStyle} />;
}
