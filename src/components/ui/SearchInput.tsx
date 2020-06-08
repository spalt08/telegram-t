import React, {
  FC, useRef, useEffect, memo,
} from '../../lib/teact/teact';

import Loading from './Loading';

import './SearchInput.scss';

type OwnProps = {
  value?: string;
  className?: string;
  focused?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
};

const SearchInput: FC<OwnProps> = ({
  value,
  className,
  focused,
  isLoading,
  placeholder = 'Search',
  onChange,
  onFocus,
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
        placeholder={placeholder}
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

export default memo(SearchInput);
