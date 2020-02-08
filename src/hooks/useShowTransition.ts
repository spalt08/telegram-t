import { useEffect, useRef, useState } from '../lib/teact/teact';

const CLOSE_DURATION = 350;

export default (isOpen = false, onCloseTransitionEnd?: () => void, noOpenTransition = false) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const closeTimeoutRef = useRef<number>();
  // СSS class should be added in a separate tick to turn on CSS transition.
  const [hasAsyncOpenClassName, setHasAsyncOpenClassName] = useState(false);

  useEffect(() => {
    setHasAsyncOpenClassName(isOpen && shouldRender);

    if (isOpen) {
      setShouldRender(true);

      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    } else if (!closeTimeoutRef.current) {
      closeTimeoutRef.current = window.setTimeout(() => {
        if (isOpen) {
          return;
        }

        setShouldRender(false);

        if (onCloseTransitionEnd) {
          onCloseTransitionEnd();
        }

        closeTimeoutRef.current = null;
      }, CLOSE_DURATION);
    }
  }, [isOpen, shouldRender, onCloseTransitionEnd]);

  const transitionClassNames = [];
  const hasOpenClassName = hasAsyncOpenClassName || (isOpen && noOpenTransition);
  if (hasOpenClassName) {
    transitionClassNames.push('open');
  }
  if (shouldRender) {
    transitionClassNames.push('shown');
  }

  return {
    shouldRender,
    transitionClassNames,
  };
};
