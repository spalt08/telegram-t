import { MouseEvent as ReactMouseEvent, FocusEvent } from 'react';

import React, { FC } from '../../lib/teact/teact';

import Spinner from './Spinner';
import './Button.scss';
import RippleEffect from './RippleEffect';

type MouseEventHandler = (e: ReactMouseEvent<HTMLButtonElement>) => void;
type OnFocusHandler = (e: FocusEvent<HTMLButtonElement>) => void;

interface IProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: Function;
  onMouseDown?: Function;
  onMouseEnter?: Function;
  onFocus?: Function;
  children: any;
  size?: 'default' | 'smaller';
  color?: 'primary' | 'secondary' | 'danger' | 'translucent' | 'translucent-white';
  className?: string;
  round?: boolean;
  isText?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
}

const Button: FC<IProps> = ({
  type = 'button',
  onClick,
  onMouseDown,
  onMouseEnter,
  onFocus,
  children,
  size = 'default',
  color = 'primary',
  className,
  round,
  isText,
  isLoading,
  ariaLabel,
}) => {
  let combinedClass = 'Button';
  combinedClass += ` ${size} ${color}`;

  if (round) {
    combinedClass += ' round';
  }
  if (className) {
    combinedClass += ` ${className}`;
  }
  if (isText) {
    combinedClass += ' text';
  }
  if (isLoading) {
    combinedClass += ' loading';
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button
      type={type}
      className={combinedClass}
      onClick={onClick ? onClick as MouseEventHandler : undefined}
      onMouseDown={onMouseDown ? onMouseDown as MouseEventHandler : undefined}
      onMouseEnter={onMouseEnter ? onMouseEnter as MouseEventHandler : undefined}
      onFocus={onFocus ? onFocus as OnFocusHandler : undefined}
      aria-label={ariaLabel}
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
