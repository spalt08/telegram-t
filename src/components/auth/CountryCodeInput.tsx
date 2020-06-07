import React, {
  FC, useState, useEffect, memo, useCallback,
} from '../../lib/teact/teact';

import { countryList } from '../../util/phoneNumber';
import { PLATFORM_ENV } from '../../util/environment';
import searchWords from '../../util/searchWords';
import buildClassName from '../../util/buildClassName';

import DropdownMenu from '../ui/DropdownMenu';
import MenuItem from '../ui/MenuItem';
import Spinner from '../ui/Spinner';

import './CountryCodeInput.scss';

type OwnProps = {
  id: string;
  value?: Country;
  isLoading?: boolean;
  onChange?: (value: Country) => void;
};

const DROPDOWN_HIDING_DURATION = 100;
const BASE_FLAG_CLASS = PLATFORM_ENV === 'Windows'
  ? 'country-flag sprite'
  : 'country-flag';

const CountryCodeInput: FC<OwnProps> = (props) => {
  const {
    id,
    value,
    isLoading,
    onChange,
  } = props;
  const [filter, setFilter] = useState<string | undefined>();
  const [filteredList, setFilteredList] = useState(countryList);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    setTimeout(() => updateFilter(undefined), DROPDOWN_HIDING_DURATION);
  }, [value]);

  function updateFilter(filterValue?: string) {
    setFilter(filterValue);
    setFilteredList(getFilteredList(filterValue));
    setFocusedIndex(-1);
  }

  const handleChange = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
    const { countryId } = (e.currentTarget.firstElementChild as HTMLDivElement).dataset;

    const country: Country | undefined = countryList.find((c) => c.id === countryId);
    if (country && onChange) {
      onChange(country);
    }
  }, [onChange]);

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
    const dropdown = document.querySelector('.CountryCodeInput .menu-container') as Element;

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

    const item = dropdown.childNodes[newIndex] as HTMLElement;
    if (item) {
      setFocusedIndex(newIndex);
      item.focus();
    }
  }

  const CodeInput: FC<{ onTrigger: () => void; isOpen?: boolean }> = ({ onTrigger, isOpen }) => {
    const handleTrigger = () => {
      if (isOpen) {
        return;
      }
      onTrigger();
    };

    const inputValue = filter !== undefined
      ? filter
      : (value && value.name) || '';

    return (
      <div className={buildClassName('input-group', value && 'touched')}>
        <input
          className={`form-control ${isOpen ? 'focus' : ''}`}
          type="text"
          id={id}
          value={inputValue}
          placeholder="Country"
          autoComplete="off"
          onClick={handleTrigger}
          onFocus={handleTrigger}
          onInput={onInput}
          onKeyDown={onInputKeyDown}
        />
        <label>Country</label>
        {isLoading ? (
          <Spinner color="black" />
        ) : (
          <i onClick={handleTrigger} className={buildClassName('css-icon-down', isOpen && 'open')} />
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
          <span data-country-id={country.id} />
          <span className={`${BASE_FLAG_CLASS} ${country.id.toLowerCase()}`}>{country.flag}</span>
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

export default memo(CountryCodeInput);
