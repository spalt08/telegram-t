import { useEffect, useRef, useState } from '../lib/teact/teact';

const CLOSE_DURATION = 350;

export default (isOpen = false, onCloseTransitionEnd?: () => void, noOpenTransition = false) => {
  const [isClosed, setIsClosed] = useState(!isOpen);
  const closeTimeoutRef = useRef<number>();
  // СSS class should be added in a separate tick to turn on CSS transition.
  const [hasAsyncOpenClassName, setHasAsyncOpenClassName] = useState(false);

  useEffect(() => {
    setHasAsyncOpenClassName(isOpen);
  }, [isOpen]);

  if (isOpen) {
    setIsClosed(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  } else if (!isClosed && !closeTimeoutRef.current) {
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsClosed(true);

      if (onCloseTransitionEnd) {
        onCloseTransitionEnd();
      }

      closeTimeoutRef.current = null;
    }, CLOSE_DURATION);
  }

  const shouldRender = isOpen || closeTimeoutRef.current;
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
