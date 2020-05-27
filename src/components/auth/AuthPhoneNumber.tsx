import { ChangeEvent } from 'react';
import React, {
  FC, useState, useEffect, useCallback, useLayoutEffect, useRef, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../global/types';

import { formatPhoneNumber, getCountryFromPhoneNumber, getCountryById } from '../../util/phoneNumber';
import { preloadImage } from '../../util/files';
import { pick } from '../../util/iteratees';

import Button from '../ui/Button';
import InputText from '../ui/InputText';
import CountryCodeInput from './CountryCodeInput';
import Checkbox from '../ui/Checkbox';
import Loading from '../ui/Loading';

// @ts-ignore
import monkeyPath from '../../assets/monkey.svg';

type StateProps = Pick<GlobalState, (
  'connectionState' | 'authState' |
  'authPhoneNumber' | 'authIsLoading' | 'authIsLoadingQrCode' | 'authError' | 'authRememberMe' | 'authNearestCountry'
)>;
type DispatchProps = Pick<GlobalActions, (
  'setAuthPhoneNumber' | 'setAuthRememberMe' | 'loadNearestCountry' | 'clearAuthError' | 'gotToAuthQrCode'
)>;

const MIN_NUMBER_LENGTH = 10;

let monkeyPreloadPromise: Promise<HTMLImageElement>;

const AuthPhoneNumber: FC<StateProps & DispatchProps> = ({
  connectionState,
  authState,
  authPhoneNumber,
  authIsLoading,
  authIsLoadingQrCode,
  authError,
  authRememberMe,
  authNearestCountry,
  setAuthPhoneNumber,
  setAuthRememberMe,
  loadNearestCountry,
  clearAuthError,
  gotToAuthQrCode,
}) => {
  const phoneNumberRef = useRef<HTMLInputElement>();
  const [country, setCountry] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [isTouched, setIsTouched] = useState(false);
  const [lastSelection, setLastSelection] = useState<[number, number] | undefined>();

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

  useLayoutEffect(() => {
    if (phoneNumberRef.current && lastSelection) {
      phoneNumberRef.current.setSelectionRange(...lastSelection);
    }
  }, [lastSelection]);

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

    const { value, selectionStart, selectionEnd } = e.target;
    setLastSelection(
      selectionStart && selectionEnd && selectionEnd < value.length
        ? [selectionStart, selectionEnd]
        : undefined,
    );

    setIsTouched(true);
    parseFullNumber(value);
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

  const isAuthReady = authState === 'authorizationStateWaitPhoneNumber';

  return (
    <div id="auth-phone-number-form" className="auth-form">
      <div id="logo" />
      <div className="caption-image" />
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
          ref={phoneNumberRef}
          id="sign-in-phone-number"
          label="Phone Number"
          value={fullNumber}
          error={authError}
          inputMode="tel"
          onChange={handlePhoneNumberChange}
        />
        <Checkbox
          id="sign-in-keep-session"
          label="Keep me signed in"
          checked={Boolean(authRememberMe)}
          onChange={handleKeepSessionChange}
        />
        {canSubmit && (
          isAuthReady ? (
            <Button type="submit" ripple isLoading={authIsLoading}>Next</Button>
          ) : (
            <Loading />
          )
        )}
        {isAuthReady && (
          <Button isText ripple isLoading={authIsLoadingQrCode} onClick={gotToAuthQrCode}>
            Log in by QR code
          </Button>
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

export default memo(withGlobal(
  (global): StateProps => pick(global, [
    'connectionState',
    'authState',
    'authPhoneNumber',
    'authIsLoading',
    'authIsLoadingQrCode',
    'authError',
    'authRememberMe',
    'authNearestCountry',
  ]),
  (setGlobal, actions): DispatchProps => pick(actions, [
    'setAuthPhoneNumber',
    'setAuthRememberMe',
    'clearAuthError',
    'loadNearestCountry',
    'gotToAuthQrCode',
  ]),
)(AuthPhoneNumber));
