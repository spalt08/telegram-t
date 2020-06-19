import { RefObject } from 'react';
import { useState, useEffect, useCallback } from '../lib/teact/teact';

import { IAnchorPosition } from '../types';
import { IS_TOUCH_ENV } from '../util/environment';

const LONG_TAP_DURATION_MS = 250;

type BooleanFunction = () => boolean | undefined;

export default (
  elementRef: RefObject<HTMLElement>,
  isMenuDisabled?: boolean | BooleanFunction,
) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<IAnchorPosition | undefined>(undefined);

  const getIsMenuDisabled = typeof isMenuDisabled === 'function' ? isMenuDisabled : () => isMenuDisabled;

  const handleBeforeContextMenu = useCallback((e: React.MouseEvent) => {
    if (!getIsMenuDisabled() && e.button === 2) {
      document.body.classList.add('no-selection');
    }
  }, [getIsMenuDisabled]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (getIsMenuDisabled()) {
      return;
    }
    e.preventDefault();
    document.body.classList.remove('no-selection');

    if (contextMenuPosition) {
      return;
    }

    setIsContextMenuOpen(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }, [getIsMenuDisabled, contextMenuPosition]);

  const handleContextMenuClose = useCallback(() => {
    setIsContextMenuOpen(false);
  }, []);

  const handleContextMenuHide = useCallback(() => {
    setContextMenuPosition(undefined);
  }, []);

  // Support context menu on touch-devices
  useEffect(() => {
    if (getIsMenuDisabled() || !IS_TOUCH_ENV) {
      return undefined;
    }

    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    let timer: number | undefined;

    const clearLongPressTimer = () => {
      document.body.classList.remove('no-selection');

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
      if (getIsMenuDisabled()) {
        return;
      }
      clearLongPressTimer();

      document.body.classList.add('no-selection');
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
  }, [contextMenuPosition, getIsMenuDisabled, elementRef]);

  return {
    isContextMenuOpen,
    contextMenuPosition,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
    handleContextMenuHide,
  };
};
