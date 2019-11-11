type AnyArgsFunction = (...args: any) => void;
type NoArgsFunction = () => void;

export function throttle<F extends AnyArgsFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
) {
  let interval: number | null = null;
  let isPending: boolean;
  let args: Parameters<F>;

  return (..._args: Parameters<F>) => {
    isPending = true;
    args = _args;

    if (!interval) {
      if (shouldRunFirst) {
        isPending = false;
        fn(...args);
      }

      interval = window.setInterval(() => {
        if (!isPending) {
          window.clearInterval(interval!);
          interval = null;
          return;
        }

        isPending = false;
        fn(...args);
      }, ms);
    }
  };
}

export function debounce<F extends NoArgsFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
  shouldRunLast = true,
) {
  let waitingTimeout: number | null = null;

  return () => {
    if (waitingTimeout) {
      clearTimeout(waitingTimeout);
      waitingTimeout = null;
    } else if (shouldRunFirst) {
      fn();
    }

    // TODO `window.` is a workaround for TS.
    waitingTimeout = window.setTimeout(() => {
      if (shouldRunLast) {
        fn();
      }

      waitingTimeout = null;
    }, ms);
  };
}

// TODO Fix implementation. Move teact to debounce.
export function throttleWithRaf<F extends AnyArgsFunction>(fn: F) {
  let waiting = false;
  let args: Parameters<F>;

  return (..._args: Parameters<F>) => {
    args = _args;

    if (!waiting) {
      waiting = true;

      requestAnimationFrame(() => {
        waiting = false;
        fn(...args);
      });
    }
  };
}

export function onNextTick(cb: () => void) {
  Promise.resolve().then(cb);
}
