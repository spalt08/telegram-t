import { TransitionEvent } from 'react';
import { useCallback, useEffect, useState } from '../lib/teact/teact';

export default (isOpen = false, onCloseAnimationEnd?: () => void) => {
  const [hasOpenClassName, setHasOpenClassName] = useState(false);
  const [isShown, setIsShown] = useState(isOpen);

  useEffect(() => {
    setHasOpenClassName(isOpen && isShown);

    if (isOpen && !isShown) {
      setIsShown(true);
    }
  }, [isOpen, isShown]);

  const handleCloseAnimationEnd = useCallback((e: TransitionEvent<HTMLElement>) => {
    if (isOpen || e.target !== e.currentTarget) {
      return;
    }

    setIsShown(false);

    if (onCloseAnimationEnd) {
      onCloseAnimationEnd();
    }
  }, [isOpen, onCloseAnimationEnd]);

  const overlayClassNames = [];
  if (hasOpenClassName) {
    overlayClassNames.push('open');
  }
  if (isShown) {
    overlayClassNames.push('shown');
  }

  return {
    isShown,
    overlayClassNames,
    handleCloseAnimationEnd,
  };
};
