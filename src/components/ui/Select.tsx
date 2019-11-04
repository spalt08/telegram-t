import { ChangeEvent } from 'react';
import React, { FC, JsxChildren } from '../../lib/reactt';

import './Select.scss';

interface IProps {
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void,
  name?: string,
  children: JsxChildren,
}

const Select: FC<IProps> = ({ onChange, name, children }: IProps) => {
  return (
    <select className='Select' name={name} onChange={onChange}>
      {children}
    </select>
  );
};

export default Select;
