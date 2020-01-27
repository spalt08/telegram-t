import { ChangeEvent } from 'react';
import React, {
  FC, useState, useEffect, useCallback,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../store/types';
import { formatPhoneNumber, getCountryFromPhoneNumber, getCountryById } from '../../util/phoneNumber';

import Button from '../ui/Button';
import InputText from '../ui/InputText';
import CountryCodeInput from './CountryCodeInput';
import Checkbox from '../ui/Checkbox';
import Loading from '../ui/Loading';

type IProps = (
  Pick<GlobalState, (
    'connectionState' |
    'authState' | 'authPhoneNumber' | 'authIsLoading' | 'authError' | 'authRememberMe' | 'authNearestCountry'
  )> &
  Pick<GlobalActions, 'setAuthPhoneNumber' | 'setAuthRememberMe' | 'loadNearestCountry' | 'clearAuthError'>
);

const MIN_NUMBER_LENGHT = 10;

const AuthPhoneNumber: FC<IProps> = ({
  connectionState,
  authState,
  authPhoneNumber,
  authIsLoading,
  authError,
  authRememberMe,
  authNearestCountry,
  setAuthPhoneNumber,
  setAuthRememberMe,
  clearAuthError,
  loadNearestCountry,
}) => {
  const [country, setCountry] = useState(undefined);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const fullNumber = getNumberWithCode(phoneNumber, country);
  const isButtonShown = fullNumber.replace(/[^\d]+/g, '').length >= MIN_NUMBER_LENGHT;

  useEffect(() => {
    if (connectionState === 'connectionStateReady' && !authNearestCountry) {
      loadNearestCountry();
    }
  }, [connectionState, authNearestCountry, loadNearestCountry]);

  useEffect(() => {
    if (authNearestCountry && !country && !isTouched) {
      setCountry(getCountryById(authNearestCountry));
    }
  }, [country, authNearestCountry, isTouched]);

  const parseFullNumber = useCallback((newFullNumber: string) => {
    const suggestedCountry = getCountryFromPhoneNumber(newFullNumber);
    const selectedCountry = !country || (suggestedCountry && suggestedCountry.id !== country.id)
      ? suggestedCountry
      : country;

    if (!newFullNumber.length) {
      setCountry(undefined);
    } else if (!country || (selectedCountry && selectedCountry.code !== country.code)) {
      setCountry(selectedCountry);
    }

    setPhoneNumber(formatPhoneNumber(newFullNumber, selectedCountry));
  }, [country]);

  useEffect(() => {
    if (!fullNumber && authPhoneNumber) {
      parseFullNumber(authPhoneNumber);
    }
  }, [fullNumber, authPhoneNumber, parseFullNumber]);

  function handleCountryChange(newCountry?: Country) {
    setCountry(newCountry);
  }

  function handlePhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    setIsTouched(true);
    parseFullNumber(e.target.value);
  }

  function handleKeepSessionChange(e: ChangeEvent<HTMLInputElement>) {
    setAuthRememberMe(e.target.checked);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authIsLoading) {
      return;
    }

    setAuthPhoneNumber({ phoneNumber: fullNumber });
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
          onChange={handleCountryChange}
        />
        <InputText
          id="sign-in-phone-number"
          label="Phone Number"
          onChange={handlePhoneNumberChange}
          value={fullNumber}
          error={authError}
        />
        <Checkbox
          id="sign-in-keep-session"
          label="Keep me signed in"
          checked={Boolean(authRememberMe)}
          onChange={handleKeepSessionChange}
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
      connectionState, authState, authPhoneNumber, authIsLoading, authError, authRememberMe, authNearestCountry,
    } = global;
    return {
      connectionState, authState, authPhoneNumber, authIsLoading, authError, authRememberMe, authNearestCountry,
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
