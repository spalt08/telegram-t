import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/teact/teact';

import './Radio.scss';

interface IProps {
  id?: string;
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Radio: FC<IProps> = ({
  id,
  label,
  value,
  name,
  checked,
  onChange,
}) => {
  return (
    <label className="Radio">
      <input
        type="radio"
        name={name}
        value={value}
        id={id}
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
};

export default Radio;
