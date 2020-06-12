import { ChangeEvent } from 'react';
import React, { FC, memo } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import Spinner from './Spinner';

import './Checkbox.scss';

type OwnProps = {
  id?: string;
  value?: string;
  label: string;
  subLabel?: string;
  checked: boolean;
  disabled?: boolean;
  round?: boolean;
  isLoading?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Checkbox: FC<OwnProps> = ({
  id,
  value,
  label,
  subLabel,
  checked,
  disabled,
  round,
  isLoading,
  onChange,
}) => {
  const className = buildClassName(
    'Checkbox',
    disabled && 'disabled',
    round && 'round',
    isLoading && 'loading',
  );

  return (
    <label className={className}>
      <input
        type="checkbox"
        id={id}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <div className="Checkbox-main">
        <span className="label">{label}</span>
        {subLabel && <span className="subLabel">{subLabel}</span>}
      </div>
      {isLoading && <Spinner />}
    </label>
  );
};

export default memo(Checkbox);
