import { ChangeEvent, FormEvent, RefObject } from 'react';
import React, { FC } from '../../lib/teact/teact';

type OwnProps = {
  ref?: RefObject<HTMLInputElement>;
  id?: string;
  value?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: FormEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

const InputText: FC<OwnProps> = ({
  ref,
  id,
  value,
  label,
  error,
  placeholder,
  onChange,
  onInput,
  onKeyPress,
  onBlur,
}) => {
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
        ref={ref}
        className="form-control"
        type="text"
        id={id}
        value={value || ''}
        onChange={onChange}
        onInput={onInput}
        onKeyPress={onKeyPress}
        onBlur={onBlur}
        placeholder={placeholder || label}
      />
      {(error || label) && (
        <label>{error || label}</label>
      )}
    </div>
  );
};

export default InputText;
