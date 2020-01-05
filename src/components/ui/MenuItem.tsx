import React, { FC } from '../../lib/teact';

import RippleEffect from './RippleEffect';

type OnClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

interface IProps {
  icon?: string;
  className?: string;
  children: any;
  onClick?: OnClickHandler;
  disabled?: boolean;
}

const MenuItem: FC<IProps> = (props) => {
  const {
    icon,
    className,
    children,
    onClick,
    disabled,
  } = props;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled || !onClick) {
      return;
    }
    onClick(e);
  };

  return (
    <li className={`MenuItem ${className}`}>
      <button type="button" onClick={handleClick} disabled={disabled}>
        {icon && (
          <i className={`icon-${icon}`} />
        )}
        {children}
        <RippleEffect />
      </button>
    </li>
  );
};

export default MenuItem;
