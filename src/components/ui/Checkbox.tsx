import { ChangeEvent } from 'react';
import React, { FC, memo } from '../../lib/teact/teact';

import './Checkbox.scss';

type OwnProps = {
  id?: string;
  label: string;
  subLabel?: string;
  checked: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Checkbox: FC<OwnProps> = ({
  id,
  label,
  subLabel,
  checked,
  onChange,
}) => {
  return (
    <label className="Checkbox">
      <input
        type="checkbox"
        id={id}
        checked={checked}
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
