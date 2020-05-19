import React, { FC } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import RippleEffect from './RippleEffect';
import AttentionIndicator from './AttentionIndicator';

import './MenuItem.scss';

type OnClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

type OwnProps = {
  icon?: string;
  className?: string;
  children: any;
  onClick?: OnClickHandler;
  disabled?: boolean;
  attention?: boolean;
  ripple?: boolean;
};

const MenuItem: FC<OwnProps> = (props) => {
  const {
    icon,
    className,
    children,
    onClick,
    disabled,
    attention,
    ripple,
  } = props;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled || !onClick) {
      return;
    }
    onClick(e);
  };

  const fullClassName = buildClassName(
    'MenuItem',
    className,
    ripple && 'has-ripple',
  );

  return (
    <div className={fullClassName}>
      <button type="button" onClick={handleClick} disabled={disabled}>
        {icon && (
          <i className={`icon-${icon}`} />
        )}
        {children}
        {!disabled && ripple && (
          <RippleEffect />
        )}
        {attention && <AttentionIndicator show={attention} />}
      </button>
    </div>
  );
};

export default MenuItem;
