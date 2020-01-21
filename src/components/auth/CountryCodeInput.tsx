import React, { FC, useState, useEffect } from '../../lib/teact/teact';

import { countryList } from '../../util/phoneNumber';
import { getPlatform } from '../../util/environment';
import searchWords from '../../util/searchWords';

import DropdownMenu from '../ui/DropdownMenu';
import MenuItem from '../ui/MenuItem';
import Spinner from '../ui/Spinner';

import './CountryCodeInput.scss';

type IProps = {
  id: string;
  value?: Country;
  isLoading?: boolean;
  onChange?: (value: Country) => void;
};

const DROPDOWN_HIDING_DURATION = 100;

const CountryCodeInput: FC<IProps> = (props) => {
  const {
    id,
    value,
    isLoading,
    onChange,
  } = props;
  const [filter, setFilter] = useState(undefined);
  const [filteredList, setFilteredList] = useState(countryList);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    setTimeout(() => updateFilter(undefined), DROPDOWN_HIDING_DURATION);
  }, [value]);

  let className = 'input-group';
  if (value) {
    className += ' touched';
  }

  const baseFlagClass = getPlatform() === 'Windows'
    ? 'country-flag sprite'
    : 'country-flag';

  function updateFilter(filterValue?: string) {
    setFilter(filterValue);
    setFilteredList(getFilteredList(filterValue));
    setFocusedIndex(-1);
  }

  function handleChange(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    const target = e.currentTarget as HTMLButtonElement;
    const input = target.querySelector('input');

    const country: Country | undefined = countryList.find((c) => input && c.id === input.value);
    if (country && onChange) {
      onChange(country);
    }
  }

  function onInput(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement;
    updateFilter(target.value);
  }

  function onInputKeyDown(e: React.KeyboardEvent<any>) {
    if (e.keyCode !== 8) {
      return;
    }

    const target = e.target as HTMLInputElement;
    if (value && filter === undefined) {
      target.value = '';
    }
    updateFilter(target.value);
  }

  function onKeyDown(e: React.KeyboardEvent<any>) {
    const dropdown = document.querySelector('.CountryCodeInput ul') as Element;
    if (e.keyCode !== 38 && e.keyCode !== 40) {
      return;
    }

    let newIndex = focusedIndex;

    if (e.keyCode === 38 && newIndex > 0) {
      newIndex--;
    } else if (e.keyCode === 40 && newIndex < dropdown.children.length - 1) {
      newIndex++;
    } else if (dropdown.children.length === 1) {
      newIndex = 0;
    } else {
      return;
    }

    const item = dropdown.childNodes[newIndex].firstChild as HTMLElement;
    if (item) {
      setFocusedIndex(newIndex);
      item.focus();
    }
  }

  const CodeInput: FC<{ onClick: () => void; isOpen?: boolean }> = ({ onClick, isOpen }) => {
    const handleClick = () => {
      if (isOpen) {
        return;
      }
      onClick();
    };

    const inputValue = filter !== undefined
      ? filter
      : (value && value.name) || '';

    return (
      <div className={className}>
        <input
          className={`form-control ${isOpen ? 'focus' : ''}`}
          type="text"
          id={id}
          value={inputValue}
          placeholder="Country"
          autoComplete="off"
          onClick={handleClick}
          onFocus={handleClick}
          onInput={onInput}
          onKeyDown={onInputKeyDown}
        />
        <label>Country</label>
        {isLoading && (
          <Spinner color="black" />
        )}
      </div>
    );
  };

  return (
    <DropdownMenu
      className="CountryCodeInput"
      trigger={CodeInput}
      onKeyDown={onKeyDown}
    >
      {filteredList.map((country: Country) => (
        <MenuItem
          key={country.id}
          className={value && country.id === value.id ? 'selected' : ''}
          onClick={handleChange}
        >
          <input type="hidden" value={country.id} />
          <span className={`${baseFlagClass} ${country.id.toLowerCase()}`}>{country.flag}</span>
          <span className="country-name">{country.name}</span>
          <span className="country-code">{country.code}</span>
        </MenuItem>
      ))}
      {!filteredList.length && (
        <MenuItem
          key="no-results"
          className="no-results"
          disabled
        >
          <span>No countries matched your filter.</span>
        </MenuItem>
      )}
    </DropdownMenu>
  );
};

function getFilteredList(filter = ''): Country[] {
  return filter.length
    ? countryList.filter((country) => searchWords(country.name, filter))
    : countryList;
}

export default CountryCodeInput;
