import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/teact';

interface IProps {
  id?: string;
  value?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const InputText: FC<IProps> = (props) => {
  const {
    id,
    value,
    label,
    error,
    placeholder,
    onChange,
    onKeyPress,
  } = props;

  let className = 'input-group';
  if (value) {
    className += ' touched';
  }
  if (error) {
    className += ' error';
  }

  return (
    <div className={className}>
      <input
        className="form-control"
        type="text"
        id={id}
        value={value || ''}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder || label}
      />
      {(error || label) && (
        <label>{error || label}</label>
      )}
    </div>
  );
};

export default InputText;
