import { MouseEvent } from 'react';

import React, { FC, JsxChildren } from '../../lib/teact';

import './DropdownMenu.scss';

type OnClickHandler = (e: MouseEvent<HTMLButtonElement>) => void;

interface IProps {
  icon: string,
  children: JsxChildren,
  onClick: OnClickHandler,
}

const DropdownMenuItem: FC<IProps> = (props) => {
  const {
    icon,
    children,
    onClick,
  } = props;

  return (
    <li className="DropdownMenuItem">
      <button type="button" onClick={onClick as OnClickHandler}>
        <i className={`icon-${icon}`} />
        {children}
      </button>
    </li>
  );
};

export default DropdownMenuItem;
