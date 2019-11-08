import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/teact';

interface IProps {
  id?: string,
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
  placeholder: string,
}

const InputText: FC<IProps> = ({ id, onChange, onKeyPress, placeholder }) => {
  return (
    <input
      className="form-control"
      type="text"
      id={id}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
    />
  );
};

export default InputText;
