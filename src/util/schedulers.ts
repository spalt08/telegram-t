type AnyArgsFunction = (...args: any) => void;
type NoArgsFunction = () => void;
type Scheduler = typeof requestAnimationFrame | typeof onNextTick | typeof runNow;

export function debounce<F extends AnyArgsFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
  shouldRunLast = true,
) {
  let waitingTimeout: number | null = null;

  return (...args: Parameters<F>) => {
    if (waitingTimeout) {
      clearTimeout(waitingTimeout);
      waitingTimeout = null;
    } else if (shouldRunFirst) {
      // @ts-ignore
      fn(...args);
    }

    // TODO `window.` is a workaround for TS.
    waitingTimeout = window.setTimeout(() => {
      if (shouldRunLast) {
        // @ts-ignore
        fn(...args);
      }

      waitingTimeout = null;
    }, ms);
  };
}

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
        // @ts-ignore
        fn(...args);
      }

      interval = window.setInterval(() => {
        if (!isPending) {
          window.clearInterval(interval!);
          interval = null;
          return;
        }

        isPending = false;
        // @ts-ignore
        fn(...args);
      }, ms);
    }
  };
}

export function throttleWithRaf<F extends AnyArgsFunction>(fn: F) {
  return throttleWith(requestAnimationFrame, fn);
}

export function throttleWithNextTick<F extends AnyArgsFunction>(fn: F) {
  return throttleWith(onNextTick, fn);
}

export function throttleWithNow<F extends AnyArgsFunction>(fn: F) {
  return throttleWith(runNow, fn);
}

export function throttleWith<F extends AnyArgsFunction>(schedulerFn: Scheduler, fn: F) {
  let waiting = false;
  let args: Parameters<F>;

  return (..._args: Parameters<F>) => {
    args = _args;

    if (!waiting) {
      waiting = true;

      schedulerFn(() => {
        waiting = false;
        // @ts-ignore
        fn(...args);
      });
    }
  };
}

export function onNextTick(cb: NoArgsFunction) {
  Promise.resolve().then(cb);
}

function runNow(fn: NoArgsFunction) {
  fn();
}

export const pause = (ms: number) => new Promise((resolve) => {
  setTimeout(() => resolve(), ms);
});
