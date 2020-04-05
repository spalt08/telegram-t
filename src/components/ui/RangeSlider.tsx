import { ChangeEvent } from 'react';
import React, { FC, useCallback } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import './RangeSlider.scss';

type OwnProps = {
  options: string[];
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const RangeSlider: FC<OwnProps> = ({
  options,
  value,
  disabled,
  onChange,
}) => {
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.currentTarget.value));
  }, [onChange]);

  const className = buildClassName(
    'RangeSlider',
    disabled && 'disabled',
  );

  const trackWidth = (value / (options.length - 1)) * 100;

  return (
    <div className={className}>
      <div
        className="slider-fill-track"
        // @ts-ignore
        style={`width: ${trackWidth}%`}
      />
      <input
        min={0}
        max={options.length - 1}
        value={value}
        step={1}
        type="range"
        onChange={handleChange}
      />
      <div className="slider-options">
        {options.map((option, index) => (
          <div className={buildClassName('slider-option', index === value && 'active')} onClick={() => onChange(index)}>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RangeSlider;
