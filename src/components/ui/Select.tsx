import { ChangeEvent } from 'react';
import React, { JsxChildren } from '../../lib/reactt';

import './Select.scss';

interface IProps {
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void,
  name?: string,
  children: JsxChildren,
}

const Select = ({ onChange, name, children }: IProps) => {
  return (
    <select className='Select' name={name} onChange={onChange}>
      {children}
    </select>
  );
};

export default Select;
