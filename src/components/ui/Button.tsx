import { MouseEvent } from 'react';

import React, { FC, JsxChildren } from '../../lib/teact';
import './Button.scss';

type OnClickHandler = (e: MouseEvent<HTMLButtonElement>) => void;

interface IProps {
  onClick: Function;
  children: JsxChildren;
  size?: 'default' | 'smaller';
  color?: 'primary' | 'secondary' | 'translucent';
  className?: string;
  round?: boolean;
}

const Button: FC<IProps> = ({
  onClick, children, size = 'default', color = 'primary', className, round,
}) => {
  let combinedClass = 'Button';
  combinedClass += ` ${size} ${color}`;

  if (round) {
    combinedClass += ' round';
  }
  if (className) {
    combinedClass += ` ${className}`;
  }

  return (
    <button type="button" className={combinedClass} onClick={onClick as OnClickHandler}>{children}</button>
  );
};

export default Button;
