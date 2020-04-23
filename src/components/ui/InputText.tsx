import { ChangeEvent, FormEvent, RefObject } from 'react';
import React, { FC } from '../../lib/teact/teact';

type OwnProps = {
  ref?: RefObject<HTMLInputElement>;
  id?: string;
  value?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
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
  autoComplete,
  inputMode,
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
        placeholder={placeholder || label}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={onChange}
        onInput={onInput}
        onKeyPress={onKeyPress}
        onBlur={onBlur}
      />
      {(error || label) && (
        <label>{error || label}</label>
      )}
    </div>
  );
};

export default InputText;
