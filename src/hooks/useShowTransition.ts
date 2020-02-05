import { TransitionEvent } from 'react';
import { useCallback, useEffect, useState } from '../lib/teact/teact';

export default (isOpen = false, onHideTransitionEnd?: () => void, noOpenTransition = false) => {
  const [isShown, setIsShown] = useState(isOpen);
  // СSS class should be added in a separate tick to turn on CSS transition.
  const [hasAsyncOpenClassName, setHasAsyncOpenClassName] = useState(false);
  const hasOpenClassName = hasAsyncOpenClassName || (isOpen && noOpenTransition);

  useEffect(() => {
    setHasAsyncOpenClassName(isOpen && isShown);

    if (isOpen && !isShown) {
      setIsShown(true);
    }
  }, [isOpen, isShown]);

  const handleHideTransitionEnd = useCallback((e: TransitionEvent<HTMLElement>) => {
    if (isOpen || e.target !== e.currentTarget) {
      return;
    }

    setIsShown(false);

    if (onHideTransitionEnd) {
      onHideTransitionEnd();
    }
  }, [isOpen, onHideTransitionEnd]);

  const transitionClassNames = [];
  if (hasOpenClassName) {
    transitionClassNames.push('open');
  }
  if (isShown) {
    transitionClassNames.push('shown');
  }

  return {
    isShown,
    transitionClassNames,
    handleHideTransitionEnd,
  };
};
