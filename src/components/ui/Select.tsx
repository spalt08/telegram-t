import { ChangeEvent } from 'react';
import React, { FC } from '../../lib/teact';

interface IProps {
  id?: string;
  value?: string;
  label?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: any;
}

const Select: FC<IProps> = (props) => {
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

export default Select;
