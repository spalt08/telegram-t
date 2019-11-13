import React, { FC } from '../../lib/teact';

import countryList from '../../../public/countries.json';
import getPlatform from '../../util/getPlatform';
import getEventTarget from '../../util/getEventTarget';

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

  let className = 'input-group';
  if (value) {
    className += ' touched';
  }

  const baseFlagClass = getPlatform() === 'Windows'
    ? 'country-flag sprite'
    : 'country-flag';

  function handleChange(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    const target = getEventTarget(e, 'BUTTON') as HTMLButtonElement;
    const input = target.querySelector('input');

    const country: Country | undefined = countryList.find((c) => input && c.id === input.value);
    if (country && onChange) {
      onChange(country);
    }
  }

  const CodeInput: FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className={className}>
      <input
        className="form-control"
        type="text"
        id={id}
        value={(value && value.name) || ''}
        placeholder="Country"
        readOnly
        onClick={onClick}
        onFocus={onClick}
      />
      <label>Country</label>
    </div>
  );

  return (
    <DropdownMenu
      className="CountryCodeInput"
      trigger={CodeInput}
    >
      {countryList.map((country) => (
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

export default CountryCodeInput;
