import React, { FC, useRef, useCallback } from '../../lib/teact/teact';

import { IS_TOUCH_ENV } from '../../util/environment';

import Button, { OwnProps as ButtonProps } from './Button';

type OwnProps = {
  onActivate: Function;
} & Omit<ButtonProps, (
  'onClick' | 'onMouseDown' |
  'onMouseEnter' | 'onMouseLeave' |
  'onFocus'
)>;

const BUTTON_ACTIVATE_DELAY = 100;
let openTimeout: number;
let isFirstTimeActivation = true;

const ResponsiveHoverButton: FC<OwnProps> = ({ onActivate, ...buttonProps }) => {
  const isMouseInside = useRef(false);

  const handleMouseEnter = useCallback(() => {
    isMouseInside.current = true;

    // This is used to counter additional delay caused by asyncronous module loading
    if (isFirstTimeActivation) {
      isFirstTimeActivation = false;
      onActivate();
      return;
    }

    if (openTimeout) {
      clearTimeout(openTimeout);
    }
    openTimeout = window.setTimeout(() => {
      if (isMouseInside.current) {
        onActivate();
      }
    }, BUTTON_ACTIVATE_DELAY);
  }, [onActivate]);

  const handleMouseLeave = useCallback(() => {
    isMouseInside.current = false;
  }, []);

  return (
    <Button
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...buttonProps}
      onMouseEnter={!IS_TOUCH_ENV ? handleMouseEnter : undefined}
      onMouseLeave={!IS_TOUCH_ENV ? handleMouseLeave : undefined}
      onClick={IS_TOUCH_ENV ? onActivate : undefined}
    />
  );
};

export default ResponsiveHoverButton;