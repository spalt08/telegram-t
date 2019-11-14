import { ChangeEvent } from 'react';

import React, { FC, useState } from '../../../lib/teact';
import { DispatchMap, GlobalState, withGlobal } from '../../../lib/teactn';
import countryList from '../../../../public/countries.json';
import formatPhoneNumber from '../../../util/formatPhoneNumber';

import Button from '../../../components/ui/Button';
import InputText from '../../../components/ui/InputText';
import CountryCodeInput from '../../../components/ui/CountryCodeInput';

import './Auth.scss';

type IProps = Pick<GlobalState, 'authIsLoading' | 'authError'> & Pick<DispatchMap, 'setAuthPhoneNumber'>;

const AuthPhoneNumber: FC<IProps> = ({ authIsLoading, authError, setAuthPhoneNumber }) => {
  const currentCountry = countryList.find((c) => c.id === 'RU');

  const [isButtonShown, setIsButtonShown] = useState(false);
  const [country, setCountry] = useState(currentCountry);
  const [code, setCode] = useState(currentCountry ? currentCountry.code : undefined);
  const [phone, setPhone] = useState('');

  function onCodeChange(newCountry: Country) {
    setCode(newCountry.code);
    setCountry(newCountry);
  }

  function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e;

    const phoneNumber = formatPhoneNumber(target.value, country);

    setPhone(phoneNumber);
    setIsButtonShown(phoneNumber.length >= 9);
    target.value = `${code} ${phoneNumber}`;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authIsLoading) {
      return;
    }

    const phoneNumber = `${code}${phone.replace(/[^\d]+/g, '')}`;
    setAuthPhoneNumber({ phoneNumber });
  }

  return (
    <div id="auth-phone-number-form" className="auth-form">
      <div id="logo" />
      <h2>Sign in to Telegram</h2>
      <p className="note">
        Please confirm your country and
        <br />enter your phone number.
      </p>
      <form action="" method="post" onSubmit={handleSubmit}>
        <CountryCodeInput
          id="sign-in-phone-code"
          value={country}
          onChange={onCodeChange}
        />
        <InputText
          id="sign-in-phone-number"
          label="Phone Number"
          onChange={onPhoneNumberChange}
          value={`${code} ${phone}`}
          error={authError}
        />
        {isButtonShown && (
          <Button type="submit" isLoading={authIsLoading}>Next</Button>
        )}
      </form>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { authIsLoading, authError } = global;
    return { authIsLoading, authError };
  },
  (setGlobal, actions) => {
    const { setAuthPhoneNumber } = actions;
    return { setAuthPhoneNumber };
  },
)(AuthPhoneNumber);
