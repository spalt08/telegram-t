import { ChangeEvent } from 'react';
import React, { FC, useState } from '../../../lib/teact';
import { withGlobal } from '../../../lib/teactn';

import { GlobalState, GlobalActions } from '../../../store/types';
import { formatPhoneNumber, getCountryFromPhoneNumber } from '../../../util/formatPhoneNumber';

import Button from '../../../components/ui/Button';
import InputText from '../../../components/ui/InputText';
import CountryCodeInput from '../../../components/ui/CountryCodeInput';
import Checkbox from '../../../components/ui/Checkbox';
import Loading from '../../../components/Loading';

import './Auth.scss';

type IProps = (
  Pick<GlobalState, 'authState' | 'authIsLoading' | 'authError' | 'authRememberMe'> &
  Pick<GlobalActions, 'setAuthPhoneNumber' | 'setAuthRememberMe'>
);

const AuthPhoneNumber: FC<IProps> = ({
  authState, authIsLoading, authError, authRememberMe, setAuthPhoneNumber, setAuthRememberMe,
}) => {
  // TODO: Add automatic country detection
  // const currentCountry = countryList.find((c) => c.id === 'RU');

  const [isButtonShown, setIsButtonShown] = useState(false);
  const [country, setCountry] = useState(undefined);
  const [phone, setPhone] = useState('');

  function onCountryChange(newCountry: Country) {
    setCountry(newCountry);
  }

  function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e;

    const suggestedCountry = getCountryFromPhoneNumber(target.value);
    const selectedCountry = !country || (suggestedCountry && suggestedCountry.id !== country.id)
      ? suggestedCountry
      : country;

    const phoneNumber = formatPhoneNumber(target.value, selectedCountry);

    if (
      !country
      || (selectedCountry && selectedCountry.id !== country.id)
    ) {
      onCountryChange(selectedCountry);
    }
    setPhone(phoneNumber);
    target.value = getNumberWithCode(phoneNumber, suggestedCountry);
    setIsButtonShown(target.value.replace(/[^\d]+/g, '').length >= 11);
  }

  function onKeepSessionChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e;
    setAuthRememberMe(target.checked);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authIsLoading) {
      return;
    }

    const phoneNumber = getNumberWithCode(phone, country);
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
          onChange={onCountryChange}
        />
        <InputText
          id="sign-in-phone-number"
          label="Phone Number"
          onChange={onPhoneNumberChange}
          value={getNumberWithCode(phone, country)}
          error={authError}
        />
        <Checkbox
          id="sign-in-keep-session"
          label="Keep me signed in"
          checked={Boolean(authRememberMe)}
          onChange={onKeepSessionChange}
        />
        {isButtonShown && (
          authState === 'authorizationStateWaitPhoneNumber' ? (
            <Button type="submit" isLoading={authIsLoading}>Next</Button>
          ) : (
            <Loading />
          )
        )}
      </form>
    </div>
  );
};

function getNumberWithCode(phoneNumber: string, country?: Country) {
  if (!country) {
    return phoneNumber;
  }
  return `${country.code} ${phoneNumber}`;
}

export default withGlobal(
  (global) => {
    const {
      authState, authIsLoading, authError, authRememberMe,
    } = global;
    return {
      authState, authIsLoading, authError, authRememberMe,
    };
  },
  (setGlobal, actions) => {
    const { setAuthPhoneNumber, setAuthRememberMe } = actions;
    return { setAuthPhoneNumber, setAuthRememberMe };
  },
)(AuthPhoneNumber);
