import { ChangeEvent } from 'react';
import React, { FC, memo } from '../../lib/teact/teact';

type OwnProps = {
  id?: string;
  value?: string;
  label?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: any;
};

const Select: FC<OwnProps> = (props) => {
  const {
    id,
    value,
    label,
    placeholder,
    onChange,
    children,
  } = props;

  let className = 'input-group';
  if (value) {
    className += ' touched';
  }

  return (
    <div className={className}>
      <select
        className="form-control"
        id={id}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder || label}
      >
        {children}
      </select>
      {label && id && (
        <label htmlFor={id}>{label}</label>
      )}
    </div>
  );
};

export default memo(Select);
