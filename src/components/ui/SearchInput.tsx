import React, { FC, useRef, useEffect } from '../../lib/teact/teact';

import Loading from './Loading';

import './SearchInput.scss';

type IProps = {
  value?: string;
  className?: string;
  focused?: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
};

const SearchInput: FC<IProps> = ({
  value, className, focused, isLoading, onChange, onFocus,
}) => {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (focused) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [focused]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { currentTarget } = event;
    onChange(currentTarget.value);
  }

  return (
    <div className={`SearchInput ${className || ''}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search"
        className="form-control"
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
      />
      <i className="icon-search" />
      {isLoading && (
        <Loading />
      )}
    </div>
  );
};

export default SearchInput;
