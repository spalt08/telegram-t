import { ChangeEvent } from 'react';
import React, { FC, useState, useEffect } from '../../../lib/teact';
import { withGlobal } from '../../../lib/teactn';

import { GlobalState, GlobalActions } from '../../../store/types';
import { formatPhoneNumber, getCountryFromPhoneNumber, getCountryById } from '../../../util/formatPhoneNumber';

import Button from '../../../components/ui/Button';
import InputText from '../../../components/ui/InputText';
import CountryCodeInput from '../../../components/ui/CountryCodeInput';
import Checkbox from '../../../components/ui/Checkbox';
import Loading from '../../../components/Loading';

import './Auth.scss';

type IProps = (
  Pick<GlobalState, (
    'connectionState' | 'authState' | 'authIsLoading' | 'authError' | 'authRememberMe' | 'authNearestCountry'
  )> &
  Pick<GlobalActions, 'setAuthPhoneNumber' | 'setAuthRememberMe' | 'loadNearestCountry'>
);

const AuthPhoneNumber: FC<IProps> = ({
  connectionState,
  authState,
  authIsLoading,
  authError,
  authRememberMe,
  authNearestCountry,
  setAuthPhoneNumber,
  setAuthRememberMe,
  loadNearestCountry,
}) => {
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [country, setCountry] = useState(undefined);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (connectionState === 'connectionStateReady' && !authNearestCountry) {
      loadNearestCountry();
    }
  }, [connectionState, authNearestCountry, loadNearestCountry]);

  useEffect(() => {
    if (authNearestCountry && !country) {
      const suggestedCountry = getCountryById(authNearestCountry);
      setCountry(suggestedCountry);
    }
  }, [country, authNearestCountry]);

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
    target.value = getNumberWithCode(phoneNumber, selectedCountry);
    setIsButtonShown(target.value.replace(/[^\d]+/g, '').length >= 10);
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
          isLoading={!authNearestCountry && !country}
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
      connectionState, authState, authIsLoading, authError, authRememberMe, authNearestCountry,
    } = global;
    return {
      connectionState, authState, authIsLoading, authError, authRememberMe, authNearestCountry,
    };
  },
  (setGlobal, actions) => {
    const { setAuthPhoneNumber, setAuthRememberMe, loadNearestCountry } = actions;
    return { setAuthPhoneNumber, setAuthRememberMe, loadNearestCountry };
  },
)(AuthPhoneNumber);
