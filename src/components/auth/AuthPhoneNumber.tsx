import { ChangeEvent } from 'react';
import React, { FC, useState, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../store/types';
import { formatPhoneNumber, getCountryFromPhoneNumber, getCountryById } from '../../util/phoneNumber';

import Button from '../ui/Button';
import InputText from '../ui/InputText';
import CountryCodeInput from './CountryCodeInput';
import Checkbox from '../ui/Checkbox';
import Loading from '../ui/Loading';

import './Auth.scss';

type IProps = (
  Pick<GlobalState, (
    'connectionState' | 'authState' | 'authIsLoading' | 'authError' | 'authRememberMe' | 'authNearestCountry'
  )> &
  Pick<GlobalActions, 'setAuthPhoneNumber' | 'setAuthRememberMe' | 'loadNearestCountry' | 'clearAuthError'>
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
  clearAuthError,
  loadNearestCountry,
}) => {
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [country, setCountry] = useState(undefined);
  const [phone, setPhone] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    if (connectionState === 'connectionStateReady' && !authNearestCountry) {
      loadNearestCountry();
    }
  }, [connectionState, authNearestCountry, loadNearestCountry]);

  useEffect(() => {
    if (authNearestCountry && !country && !isTouched) {
      const suggestedCountry = getCountryById(authNearestCountry);
      setCountry(suggestedCountry);
    }
  }, [country, authNearestCountry, isTouched]);

  function onCountryChange(newCountry?: Country) {
    setCountry(newCountry);
  }

  function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    setIsTouched(true);
    const { target } = e;
    const suggestedCountry = getCountryFromPhoneNumber(target.value);
    const selectedCountry = !country || (suggestedCountry && suggestedCountry.id !== country.id)
      ? suggestedCountry
      : country;

    const phoneNumber = formatPhoneNumber(target.value, selectedCountry);

    if (!country || (selectedCountry && selectedCountry.code !== country.code)) {
      onCountryChange(selectedCountry);
    }
    if (!target.value.length) {
      onCountryChange(undefined);
    }

    setPhone(phoneNumber);

    if (selectedCountry && target.value.length > 3 && target.value.length > selectedCountry.code.length) {
      target.value = getNumberWithCode(phoneNumber, selectedCountry);
    }

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
    const {
      setAuthPhoneNumber, setAuthRememberMe, clearAuthError, loadNearestCountry,
    } = actions;
    return {
      setAuthPhoneNumber, setAuthRememberMe, clearAuthError, loadNearestCountry,
    };
  },
)(AuthPhoneNumber);
