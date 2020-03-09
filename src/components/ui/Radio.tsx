import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';
import Spinner from './Spinner';

import './Radio.scss';

interface IProps {
  id?: string;
  name: string;
  label: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Radio: FC<IProps> = ({
  id,
  label,
  value,
  name,
  checked,
  disabled,
  isLoading,
  onChange,
}) => {
  const className = buildClassName(
    'Radio',
    disabled && 'disabled',
    isLoading && 'loading',
  );

  return (
    <label className={className}>
      <input
        type="radio"
        name={name}
        value={value}
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span>{label}</span>
      {isLoading && <Spinner />}
    </label>
  );
};

export default Radio;
