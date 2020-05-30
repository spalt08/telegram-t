import { ChangeEvent, FormEvent, RefObject } from 'react';
import React, { FC, memo } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

type OwnProps = {
  ref?: RefObject<HTMLInputElement>;
  id?: string;
  value?: string;
  label?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
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
  success,
  disabled,
  placeholder,
  autoComplete,
  inputMode,
  onChange,
  onInput,
  onKeyPress,
  onBlur,
}) => {
  const className = buildClassName(
    'input-group',
    value && 'touched',
    error ? 'error' : success && 'success',
    disabled && 'disabled',
  );

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
        disabled={disabled}
        onChange={onChange}
        onInput={onInput}
        onKeyPress={onKeyPress}
        onBlur={onBlur}
      />
      {(error || success || label) && (
        <label>{error || success || label}</label>
      )}
    </div>
  );
};

export default memo(InputText);
