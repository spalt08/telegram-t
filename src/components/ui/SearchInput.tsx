import React, { FC } from '../../lib/teact/teact';

import './SearchInput.scss';

type IProps = {
  value?: string;
  className?: string;
  onChange: (value: string) => void;
};

const SearchInput: FC<IProps> = ({ value, className, onChange }) => {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { currentTarget } = event;
    onChange(currentTarget.value);
  }

  return (
    <div className={`SearchInput ${className || ''}`}>
      <input
        type="text"
        placeholder="Search"
        className="form-control"
        value={value}
        onChange={handleChange}
      />
      <i className="icon-search" />
    </div>
  );
};

export default SearchInput;
