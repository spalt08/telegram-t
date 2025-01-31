import { ChangeEvent } from 'react';
import React, { FC, memo } from '../../lib/teact/teact';

type OwnProps = {
  id?: string;
  value?: string;
  hint?: string;
  error?: string;
  showPassword?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onShowToggle?: () => void;
};

const InputPassword: FC<OwnProps> = ({
  id,
  value,
  hint,
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
        placeholder={hint || 'Password'}
        autoComplete="current-password"
        onChange={onChange}
        onKeyPress={onKeyPress}
      />
      <label>{error || hint || 'Password'}</label>
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

export default memo(InputPassword);
