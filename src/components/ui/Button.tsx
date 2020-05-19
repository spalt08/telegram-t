import { MouseEvent as ReactMouseEvent, RefObject } from 'react';

import React, {
  FC, useRef, useCallback, useState,
} from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import Spinner from './Spinner';
import RippleEffect from './RippleEffect';

import './Button.scss';

export type OwnProps = {
  ref?: RefObject<HTMLButtonElement | HTMLAnchorElement>;
  type?: 'button' | 'submit' | 'reset';
  onClick?: NoneToVoidFunction;
  onMouseDown?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: NoneToVoidFunction;
  onMouseLeave?: NoneToVoidFunction;
  onFocus?: NoneToVoidFunction;
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
  ripple?: boolean;
};

// Longest animation duration;
const CLICKED_TIMEOUT = 400;

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
  ripple,
}) => {
  let elementRef = useRef<HTMLButtonElement | HTMLAnchorElement>();
  if (ref) {
    elementRef = ref;
  }

  const [isClicked, setIsClicked] = useState(false);

  const fullClassName = buildClassName(
    'Button',
    className,
    size,
    color,
    round && 'round',
    disabled && 'disabled',
    isText && 'text',
    isLoading && 'loading',
    ripple && 'has-ripple',
    isClicked && 'clicked',
  );

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }

    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, CLICKED_TIMEOUT);
  }, [disabled, onClick]);

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!disabled && onMouseDown) {
      onMouseDown(e);
    }
  }, [onMouseDown, disabled]);

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
        {!disabled && ripple && (
          <RippleEffect />
        )}
      </a>
    );
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button
      ref={elementRef as RefObject<HTMLButtonElement>}
      type={type}
      className={fullClassName}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter && !disabled ? onMouseEnter : undefined}
      onMouseLeave={onMouseLeave && !disabled ? onMouseLeave : undefined}
      onFocus={onFocus && !disabled ? onFocus : undefined}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {isLoading ? (
        <div>
          <span>Please wait...</span>
          <Spinner color="white" />
        </div>
      ) : children}
      {!disabled && ripple && (
        <RippleEffect />
      )}
    </button>
  );
};

export default Button;
