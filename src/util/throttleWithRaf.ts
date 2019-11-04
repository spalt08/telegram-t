export default function throttleWithRaf(fn) {
  let waiting = false;
  let args;

  return function (..._args) {
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
