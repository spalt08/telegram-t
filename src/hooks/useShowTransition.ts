import { useEffect, useRef, useState } from '../lib/teact/teact';
import buildClassName from '../util/buildClassName';

const CLOSE_DURATION = 350;

export default (
  isOpen = false,
  onCloseTransitionEnd?: () => void,
  noOpenTransition = false,
  className: string | false = 'fast',
) => {
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

  const hasOpenClassName = hasAsyncOpenClassName || (isOpen && noOpenTransition);
  const shouldRender = isOpen || Boolean(closeTimeoutRef.current);
  const transitionClassNames = buildClassName(
    className && 'opacity-transition',
    className,
    hasOpenClassName && 'open',
    shouldRender && 'shown',
  );

  return {
    shouldRender,
    transitionClassNames,
  };
};
