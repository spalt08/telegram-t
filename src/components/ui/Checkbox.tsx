import { ChangeEvent } from 'react';
import React, { FC, memo } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';
import './Checkbox.scss';

type OwnProps = {
  id?: string;
  label: string;
  subLabel?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Checkbox: FC<OwnProps> = ({
  id,
  label,
  subLabel,
  checked,
  disabled,
  onChange,
}) => {
  const className = buildClassName(
    'Checkbox',
    disabled && 'disabled',
  );

  return (
    <label className={className}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <div className="Checkbox-main">
        <span className="label">{label}</span>
        {subLabel && <span className="subLabel">{subLabel}</span>}
      </div>
    </label>
  );
};

export default memo(Checkbox);
