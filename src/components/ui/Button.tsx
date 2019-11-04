import React, { JsxChildren } from '../../lib/reactt';

import './Button.scss';

interface IProps {
  children: JsxChildren,
}

const Button = ({ children }: IProps) => {
  return (
    <button className="Button">{children}</button>
  );
};

export default Button;
