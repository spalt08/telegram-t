import { MouseEvent as ReactMouseEvent, FocusEvent, RefObject } from 'react';

import React, { FC, useRef, useCallback } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import Spinner from './Spinner';
import RippleEffect from './RippleEffect';

import './Button.scss';

type MouseEventHandler = (e: ReactMouseEvent<HTMLButtonElement>) => void;
type OnFocusHandler = (e: FocusEvent<HTMLButtonElement>) => void;

export type OwnProps = {
  ref?: RefObject<HTMLButtonElement | HTMLAnchorElement>;
  type?: 'button' | 'submit' | 'reset';
  onClick?: Function;
  onMouseDown?: Function;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
  onFocus?: Function;
  children: any;
  size?: 'default' | 'smaller';
  color?: 'primary' | 'secondary' | 'gray' | 'danger' | 'translucent' | 'translucent-white';
  className?: string;
  round?: boolean;
  isText?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  href?: string;
  download?: string;
  disabled?: boolean;
};

const Button: FC<OwnProps> = ({
  ref,
  type = 'button',
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  children,
  size = 'default',
  color = 'primary',
  className,
  round,
  isText,
  isLoading,
  ariaLabel,
  href,
  download,
  disabled,
}) => {
  let elementRef = useRef<HTMLButtonElement | HTMLAnchorElement>();
  if (ref) {
    elementRef = ref;
  }

  const fullClassName = buildClassName(
    'Button',
    className,
    size,
    color,
    round && 'round',
    disabled && 'disabled',
    isText && 'text',
    isLoading && 'loading',
  );

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onMouseDown) {
      onMouseDown(e);
    }
  }, [onMouseDown]);

  if (href) {
    return (
      <a
        ref={elementRef as RefObject<HTMLAnchorElement>}
        className={fullClassName}
        href={href}
        title={ariaLabel}
        download={download}
      >
        {children}
        <RippleEffect />
      </a>
    );
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button
      ref={elementRef as RefObject<HTMLButtonElement>}
      type={type}
      className={fullClassName}
      onClick={onClick ? onClick as MouseEventHandler : undefined}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter ? onMouseEnter as MouseEventHandler : undefined}
      onMouseLeave={onMouseLeave ? onMouseLeave as MouseEventHandler : undefined}
      onFocus={onFocus ? onFocus as OnFocusHandler : undefined}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {isLoading ? (
        <div>
          <span>Please wait...</span>
          <Spinner color="white" />
        </div>
      ) : children}
      <RippleEffect />
    </button>
  );
};

export default Button;
