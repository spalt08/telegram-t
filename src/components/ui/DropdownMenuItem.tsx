import { MouseEvent as ReactMouseEvent } from 'react';

import React, { FC, JsxChildren } from '../../lib/teact';

import './DropdownMenu.scss';

type OnClickHandler = (e: ReactMouseEvent<HTMLButtonElement>) => void;

interface IProps {
  icon?: string;
  className?: string;
  children: JsxChildren;
  onClick: OnClickHandler;
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
      </button>
    </li>
  );
};

export default DropdownMenuItem;
