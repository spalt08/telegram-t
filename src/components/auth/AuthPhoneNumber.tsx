import { ChangeEvent } from 'react';
import React, {
  FC, useState, useEffect, useCallback,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../global/types';
import { formatPhoneNumber, getCountryFromPhoneNumber, getCountryById } from '../../util/phoneNumber';

import Button from '../ui/Button';
import InputText from '../ui/InputText';
import CountryCodeInput from './CountryCodeInput';
import Checkbox from '../ui/Checkbox';
import Loading from '../ui/Loading';

// @ts-ignore
import monkeyPath from '../../assets/monkey.svg';
import { preloadImage } from '../../util/files';

type StateProps = Pick<GlobalState, (
  'connectionState' |
  'authState' | 'authPhoneNumber' | 'authIsLoading' | 'authError' | 'authRememberMe' | 'authNearestCountry'
)>;
type DispatchProps = Pick<GlobalActions, (
  'setAuthPhoneNumber' | 'setAuthRememberMe' | 'loadNearestCountry' | 'clearAuthError'
)>;

const MIN_NUMBER_LENGTH = 10;

let monkeyPreloadPromise: Promise<HTMLImageElement>;

const AuthPhoneNumber: FC<StateProps & DispatchProps> = ({
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
  const [phoneNumber, setPhoneNumber] = useState(undefined);
  const [isTouched, setIsTouched] = useState(false);

  const fullNumber = getNumberWithCode(phoneNumber, country);
  const canSubmit = fullNumber && fullNumber.replace(/[^\d]+/g, '').length >= MIN_NUMBER_LENGTH;

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
    if (phoneNumber === undefined && authPhoneNumber) {
      parseFullNumber(authPhoneNumber);
    }
  }, [authPhoneNumber, phoneNumber, parseFullNumber]);

  function handleCountryChange(newCountry?: Country) {
    setCountry(newCountry);
  }

  function handlePhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    if (!monkeyPreloadPromise) {
      monkeyPreloadPromise = preloadImage(monkeyPath);
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

    if (canSubmit) {
      setAuthPhoneNumber({ phoneNumber: fullNumber });
    }
  }

  return (
    <div id="auth-phone-number-form" className="auth-form">
      <div id="logo" />
      <h2>Sign in to Telegram</h2>
      <p className="note">
        Please confirm your country and
        <br />enter your phone number.
      </p>
      <form action="" onSubmit={handleSubmit}>
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
        {canSubmit && (
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

function getNumberWithCode(phoneNumber: string = '', country?: Country) {
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
