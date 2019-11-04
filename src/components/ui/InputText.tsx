import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/reactt';

import './InputText.scss';

interface IProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void,
  placeholder: string,
}

const InputText: FC<IProps> = ({ onChange, placeholder }: IProps) => {
  return (
    <input className="InputText" type="text" onChange={onChange} placeholder={placeholder} />
  );
};

export default InputText;
