import React, {
  FC, useRef, useEffect, memo,
} from '../../lib/teact/teact';

import Loading from './Loading';

import './SearchInput.scss';

type OwnProps = {
  className?: string;
  inputId?: string;
  value?: string;
  focused?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const SearchInput: FC<OwnProps> = ({
  value,
  inputId,
  className,
  focused,
  isLoading,
  placeholder = 'Search',
  disabled,
  onChange,
  onFocus,
  onBlur,
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
        id={inputId}
        type="text"
        placeholder={placeholder}
        className="form-control"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <i className="icon-search" />
      {isLoading && (
        <Loading />
      )}
    </div>
  );
};

export default memo(SearchInput);
