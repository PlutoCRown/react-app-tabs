import { useCallback, useEffect, useMemo, useRef } from "react";

type DebounceOptions = {
  wait?: number;
};

export function useDebounceFn<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  options?: DebounceOptions,
) {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestArgsRef = useRef<TArgs | null>(null);
  const wait = options?.wait ?? 300;

  fnRef.current = fn;

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const run = useCallback(
    (...args: TArgs) => {
      latestArgsRef.current = args;
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (latestArgsRef.current) {
          fnRef.current(...latestArgsRef.current);
        }
      }, wait);
    },
    [cancel, wait],
  );

  const flush = useCallback(() => {
    if (timerRef.current === null) {
      return;
    }
    cancel();
    if (latestArgsRef.current) {
      fnRef.current(...latestArgsRef.current);
    }
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return useMemo(
    () => ({
      run,
      cancel,
      flush,
    }),
    [cancel, flush, run],
  );
}
