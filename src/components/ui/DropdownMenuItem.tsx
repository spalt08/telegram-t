import { MouseEvent as ReactMouseEvent } from 'react';

import React, { FC } from '../../lib/teact';

import './DropdownMenu.scss';
import RippleEffect from './RippleEffect';

type OnClickHandler = (e: ReactMouseEvent<HTMLButtonElement>) => void;

interface IProps {
  icon?: string;
  className?: string;
  children: any;
  onClick?: OnClickHandler;
}

const DropdownMenuItem: FC<IProps> = (props) => {
  const {
    icon,
    className,
    children,
    onClick,
  } = props;

  return (
    <li className={`DropdownMenuItem ${className}`}>
      <button type="button" onClick={onClick as OnClickHandler}>
        {icon && (
          <i className={`icon-${icon}`} />
        )}
        {children}
        <RippleEffect />
      </button>
    </li>
  );
};

export default DropdownMenuItem;
