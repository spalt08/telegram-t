import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/reactt';

import './InputText.scss';

interface IProps {
  id?: string,
  onChange: (e: ChangeEvent<HTMLInputElement>) => void,
  placeholder: string,
}

const InputText: FC<IProps> = ({ id, onChange, placeholder }: IProps) => {
  return (
    <input className="InputText" type="text" id={id} onChange={onChange} placeholder={placeholder} />
  );
};

export default InputText;
