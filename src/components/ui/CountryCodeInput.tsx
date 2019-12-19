import React, { FC, useState, useEffect } from '../../lib/teact';

import { countryList } from '../../util/formatPhoneNumber';
import getPlatform from '../../util/getPlatform';
import { getElementIndex } from '../../util/domUtils';
import searchWords from '../../util/searchWords';

import DropdownMenu from './DropdownMenu';
import DropdownMenuItem from './DropdownMenuItem';

import './CountryCodeInput.scss';

type IProps = {
  id: string;
  value?: Country;
  onChange?: (value: Country) => void;
};

const CountryCodeInput: FC<IProps> = (props) => {
  const { id, value, onChange } = props;
  const [filter, setFilter] = useState(undefined);
  const [filteredList, setFilteredList] = useState(countryList);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    updateFilter(undefined);
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

  function onKeyDown(e: React.KeyboardEvent<any>) {
    const dropdown = document.querySelector('.CountryCodeInput ul') as Element;
    if (e.keyCode !== 38 && e.keyCode !== 40) {
      return;
    }

    let newIndex = focusedIndex;
    if (e.keyCode === 38 && newIndex > 0) {
      newIndex--;
    } else if (e.keyCode === 40 && newIndex < dropdown.childNodes.length - 1) {
      newIndex++;
    } else {
      return;
    }

    const item = dropdown.childNodes[newIndex].firstChild as HTMLElement;
    if (item) {
      setFocusedIndex(newIndex);
      item.focus();
    }
  }

  function focusSelectedItem() {
    if (!value) {
      return;
    }

    const selectedItem = document.querySelector('.CountryCodeInput li.selected') as HTMLElement;
    const selectedIndex = getElementIndex(selectedItem);

    if (selectedItem && (focusedIndex < 0 || focusedIndex === selectedIndex)) {
      setFocusedIndex(getElementIndex(selectedItem));
      window.requestAnimationFrame(() => {
        const button = selectedItem.firstChild as HTMLElement;
        button.focus();
      });
    }
  }

  const CodeInput: FC<{ onClick: () => void; isOpen: boolean }> = ({ onClick, isOpen }) => {
    const handleClick = () => {
      onClick();
      focusSelectedItem();
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
        />
        <label>Country</label>
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
        <DropdownMenuItem
          key={country.id}
          className={value && country.id === value.id ? 'selected' : ''}
          onClick={handleChange}
        >
          <input type="hidden" value={country.id} />
          <span className={`${baseFlagClass} ${country.id.toLowerCase()}`}>{country.flag}</span>
          <span className="country-name">{country.name}</span>
          <span className="country-code">{country.code}</span>
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
};

function getFilteredList(filter = ''): Country[] {
  return filter.length
    ? countryList.filter((country) => searchWords(country.name, filter))
    : countryList;
}

export default CountryCodeInput;
