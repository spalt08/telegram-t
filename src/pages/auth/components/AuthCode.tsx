import { FormEvent } from 'react';
import React, { FC, useState, useEffect } from '../../../lib/teact';
import { withGlobal } from '../../../lib/teactn';
import { GlobalState, GlobalActions } from '../../../store/types';

import getMonkeyAnimationData from '../../../util/monkeys';

import InputText from '../../../components/ui/InputText';
import Loading from '../../../components/Loading';

import AnimatedSticker from '../../../components/AnimatedSticker';

import './Auth.scss';

type IProps = (
  Pick<GlobalState, 'authPhoneNumber' | 'authIsLoading' | 'authError'>
  & Pick<GlobalActions, 'setAuthCode' | 'returnToAuthPhoneNumber'>
);

const AuthCode: FC<IProps> = ({
  authPhoneNumber, authIsLoading, authError, setAuthCode, returnToAuthPhoneNumber,
}) => {
  const [code, setCode] = useState(undefined);
  const [idleMonkey, setIdleMonkey] = useState(undefined);
  const [trackingMonkey, setTrackingMonkey] = useState(undefined);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!idleMonkey) {
      getMonkeyAnimationData('MonkeyIdle').then(setIdleMonkey);
    }
    if (!trackingMonkey) {
      getMonkeyAnimationData('MonkeyTracking').then(setTrackingMonkey);
    }
  }, [idleMonkey, trackingMonkey]);

  function onCodeChange(e: FormEvent<HTMLInputElement>) {
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
        {idleMonkey && (
          <AnimatedSticker
            id="monkey-idle"
            className={isTracking ? 'hidden' : ''}
            animationData={idleMonkey}
            play
          />
        )}
        {trackingMonkey && (
          <AnimatedSticker
            id="monkey-tracking"
            className={!isTracking ? 'hidden' : ''}
            animationData={trackingMonkey}
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
    const { setAuthCode, returnToAuthPhoneNumber } = actions;
    return { setAuthCode, returnToAuthPhoneNumber };
  },
)(AuthCode);
