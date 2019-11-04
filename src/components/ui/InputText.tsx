import { ChangeEvent } from 'react';
import React from '../../lib/reactt';

import './InputText.scss';

interface IProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void,
  placeholder: string,
}

const InputText = ({ onChange, placeholder }: IProps) => {
  return (
    <input className="InputText" type="text" onChange={onChange} placeholder={placeholder} />
  );
};

export default InputText;
