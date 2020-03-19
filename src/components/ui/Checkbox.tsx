import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/teact/teact';

import './Checkbox.scss';

interface IProps {
  id?: string;
  label: string;
  checked: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: FC<IProps> = ({
  id,
  label,
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
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
