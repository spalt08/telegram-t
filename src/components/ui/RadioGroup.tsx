import { ChangeEvent } from 'react';
import React, { FC, useCallback } from '../../lib/teact/teact';
import Radio from './Radio';

type IRadioOption = {
  label: string;
  value: string;
};

interface IProps {
  id?: string;
  name: string;
  options: IRadioOption[];
  selected?: string;
  onChange: (value: string) => void;
}

const RadioGroup: FC<IProps> = ({
  id,
  name,
  options,
  selected,
  onChange,
}) => {
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    onChange(value);
  }, [onChange]);

  return (
    <div id={id} className="radio-group">
      {options.map((option) => (
        <Radio
          name={name}
          label={option.label}
          value={option.value}
          checked={option.value === selected}
          onChange={handleChange}
        />
      ))}
    </div>
  );
};

export default RadioGroup;
