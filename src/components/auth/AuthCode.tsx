import { FormEvent } from 'react';
import React, { FC, useState, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalState, GlobalActions } from '../../store/types';

import getMonkeyAnimationData from '../../util/monkeys';

import InputText from '../ui/InputText';
import Loading from '../ui/Loading';

import AnimatedSticker from '../common/AnimatedSticker';

type IProps = (
  Pick<GlobalState, 'authPhoneNumber' | 'authIsLoading' | 'authError'>
  & Pick<GlobalActions, 'setAuthCode' | 'returnToAuthPhoneNumber' | 'clearAuthError'>
);

const AuthCode: FC<IProps> = ({
  authPhoneNumber, authIsLoading, authError, setAuthCode, returnToAuthPhoneNumber, clearAuthError,
}) => {
  const [code, setCode] = useState(undefined);
  const [idleMonkeyData, setIdleMonkeyData] = useState(undefined);
  const [trackingMonkeyData, setTrackingMonkeyData] = useState(undefined);
  const [isTracking, setIsTracking] = useState(false);
  const [isIdleShownAsync, setIsIdleShownAsync] = useState(false);

  useEffect(() => {
    if (!idleMonkeyData) {
      getMonkeyAnimationData('MonkeyIdle').then(setIdleMonkeyData);
    } else {
      setIsIdleShownAsync(true);
    }
  }, [idleMonkeyData]);

  useEffect(() => {
    if (!trackingMonkeyData) {
      getMonkeyAnimationData('MonkeyTracking').then(setTrackingMonkeyData);
    }
  }, [trackingMonkeyData]);

  function onCodeChange(e: FormEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    const { currentTarget: target } = e;

    target.value = target.value.replace(/[^\d]+/, '').substr(0, 5);

    if (!isTracking) {
      setIsTracking(true);
    } else if (!target.value.length) {
      setIsTracking(false);
    }

    setCode(target.value);
    if (target.value.length === 5) {
      setAuthCode({ code: target.value });
    }
  }

  return (
    <div id="auth-code-form" className="auth-form">
      <div id="monkey">
        {idleMonkeyData && (
          <AnimatedSticker
            className={`${isTracking ? 'hidden' : ''} ${isIdleShownAsync ? 'shown' : ''}`}
            animationData={idleMonkeyData}
            play
          />
        )}
        {trackingMonkeyData && (
          <AnimatedSticker
            className={!isTracking ? 'hidden' : 'shown'}
            animationData={trackingMonkeyData}
            play={isTracking}
            noLoop
          />
        )}
      </div>
      <h2>
        {authPhoneNumber}
        <div
          className="auth-number-edit"
          onClick={() => returnToAuthPhoneNumber()}
          role="button"
          tabIndex={0}
          title="Sign In with another phone number"
        >
          <i className="icon-edit" />
        </div>
      </h2>
      <p className="note">
        We have sent you an SMS
        <br />with the code.
      </p>
      <InputText
        id="sign-in-code"
        label="Code"
        onInput={onCodeChange}
        value={code}
        error={authError}
      />
      {authIsLoading && <Loading />}
    </div>
  );
};

export default withGlobal(
  global => {
    const { authPhoneNumber, authIsLoading, authError } = global;
    return { authPhoneNumber, authIsLoading, authError };
  },
  (setGlobal, actions) => {
    const { setAuthCode, returnToAuthPhoneNumber, clearAuthError } = actions;
    return { setAuthCode, returnToAuthPhoneNumber, clearAuthError };
  },
)(AuthCode);
