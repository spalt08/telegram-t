import { RefObject } from 'react';
import { useState, useEffect, useCallback } from '../lib/teact/teact';

import { IAnchorPosition } from '../types';
import { IS_TOUCH_ENV } from '../util/environment';

const LONG_TAP_DURATION_MS = 250;

export default function (
  elementRef: RefObject<HTMLElement>,
  isMenuDisabled?: boolean,
) {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<IAnchorPosition | undefined>(undefined);

  const handleBeforeContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isMenuDisabled && e.button === 2) {
      e.currentTarget.classList.add('no-selection');
    }
  }, [isMenuDisabled]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isMenuDisabled) {
      return;
    }
    e.preventDefault();
    e.currentTarget.classList.remove('no-selection');

    if (contextMenuPosition) {
      return;
    }

    setIsContextMenuOpen(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }, [isMenuDisabled, contextMenuPosition]);

  const handleContextMenuClose = useCallback(() => {
    setIsContextMenuOpen(false);
  }, []);

  const handleContextMenuHide = useCallback(() => {
    setContextMenuPosition(undefined);
  }, []);

  // Support context menu on touch-devices
  useEffect(() => {
    if (isMenuDisabled || !IS_TOUCH_ENV) {
      return undefined;
    }

    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    let timer: number | undefined;

    const clearLongPressTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    const emulateContextMenuEvent = (originalEvent: TouchEvent) => {
      clearLongPressTimer();

      const { clientX, clientY } = originalEvent.touches[0];

      if (contextMenuPosition) {
        return;
      }

      // temporarily intercept and clear the next click
      element.addEventListener('touchend', function cancelClickOnce(e) {
        element.removeEventListener('touchend', cancelClickOnce, true);
        e.stopImmediatePropagation();
        e.preventDefault();
        e.stopPropagation();
      }, true);

      setIsContextMenuOpen(true);
      setContextMenuPosition({ x: clientX, y: clientY });
    };

    const startLongPressTimer = (e: TouchEvent) => {
      clearLongPressTimer();
      timer = window.setTimeout(() => emulateContextMenuEvent(e), LONG_TAP_DURATION_MS);
    };

    // @perf Consider event delegation
    element.addEventListener('touchstart', startLongPressTimer, true);
    element.addEventListener('touchcancel', clearLongPressTimer, true);
    element.addEventListener('touchend', clearLongPressTimer, true);
    element.addEventListener('touchmove', clearLongPressTimer, true);

    return () => {
      clearLongPressTimer();
      element.removeEventListener('touchstart', startLongPressTimer, true);
      element.removeEventListener('touchcancel', clearLongPressTimer, true);
      element.removeEventListener('touchend', clearLongPressTimer, true);
      element.removeEventListener('touchmove', clearLongPressTimer, true);
    };
  }, [contextMenuPosition, isMenuDisabled, elementRef]);

  return {
    isContextMenuOpen,
    contextMenuPosition,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
    handleContextMenuHide,
  };
}
