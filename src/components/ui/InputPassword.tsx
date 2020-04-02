import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/teact/teact';

type OwnProps = {
  id?: string;
  value?: string;
  error?: string;
  showPassword?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onShowToggle?: () => void;
};

const InputText: FC<OwnProps> = ({
  id,
  value,
  error,
  showPassword,
  onChange,
  onKeyPress,
  onShowToggle,
}) => {
  let className = 'input-group password-input';
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
        type={showPassword ? 'text' : 'password'}
        id={id}
        value={value || ''}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder="Password"
      />
      <label>{error || 'Password'}</label>
      <div
        className="toggle-password"
        onClick={onShowToggle}
        role="button"
        tabIndex={0}
        title="Toggle password visibility"
      >
        {showPassword ? (
          <i className="icon-eye" />
        ) : (
          <i className="icon-eye-closed" />
        )}
      </div>
    </div>
  );
};

export default InputText;
