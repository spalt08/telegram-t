import React, { FC, useCallback } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import RippleEffect from './RippleEffect';
import AttentionIndicator from './AttentionIndicator';

import './MenuItem.scss';

type OnClickHandler = (e: React.SyntheticEvent<HTMLDivElement>) => void;

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

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !onClick) {
      e.stopPropagation();
      e.preventDefault();

      return;
    }

    onClick(e);
  }, [disabled, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.keyCode !== 13 && e.keyCode !== 32) {
      return;
    }

    if (disabled || !onClick) {
      e.stopPropagation();
      e.preventDefault();

      return;
    }

    onClick(e);
  }, [disabled, onClick]);

  const fullClassName = buildClassName(
    'MenuItem',
    className,
    ripple && 'has-ripple',
    disabled && 'disabled',
  );

  return (
    <div role="button" tabIndex={0} className={fullClassName} onClick={handleClick} onKeyDown={handleKeyDown}>
      {icon && (
        <i className={`icon-${icon}`} />
      )}
      {children}
      {!disabled && ripple && (
        <RippleEffect />
      )}
      {attention && <AttentionIndicator show={attention} />}
    </div>
  );
};

export default MenuItem;
