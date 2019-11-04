import { MouseEvent } from 'react';

import React, { FC, JsxChildren } from '../../lib/reactt';
import './Button.scss';

type OnClickHandler = (e: MouseEvent<HTMLButtonElement>) => void;

interface IProps {
  onClick: Function
  children: JsxChildren,
}

const Button: FC<IProps> = ({ onClick, children }: IProps) => {
  return (
    <button className="Button" onClick={onClick as OnClickHandler}>{children}</button>
  );
};

export default Button;
