import React, { FC, useCallback } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import RippleEffect from './RippleEffect';

import './MenuItem.scss';

type OnClickHandler = (e: React.SyntheticEvent<HTMLDivElement>) => void;

type OwnProps = {
  icon?: string;
  className?: string;
  children: any;
  onClick?: OnClickHandler;
  href?: string;
  download?: string;
  disabled?: boolean;
  ripple?: boolean;
  destructive?: boolean;
};

const MenuItem: FC<OwnProps> = (props) => {
  const {
    icon,
    className,
    children,
    onClick,
    href,
    download,
    disabled,
    ripple,
    destructive,
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
    destructive && 'destructive',
  );

  const content = (
    <>
      {icon && (
        <i className={`icon-${icon}`} />
      )}
      {children}
      {!disabled && ripple && (
        <RippleEffect />
      )}
    </>
  );

  if (href) {
    return (
      <a
        tabIndex={0}
        className={fullClassName}
        href={href}
        download={download}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={fullClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {content}
    </div>
  );
};

export default MenuItem;
