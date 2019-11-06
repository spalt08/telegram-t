import React, { FC, JsxChildren } from '../lib/teact';

import './Avatar.scss';

interface IProps {
  small?: boolean,
  children: JsxChildren,
}

const Avatar: FC<IProps> = ({ small = false, children }) => {
  return (
    <div className={`Avatar ${small ? 'small' : ''}`}>{children}</div>
  );
};

export default Avatar;
