import { FormEvent } from 'react';
import React, {
  FC, useState, useEffect, useCallback,
} from '../../lib/teact/teact';
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

const CODE_LENGTH = 5;
const TRACKING_START_FRAME = 15;
const TRACKING_FRAMES_PER_SYMBOL = 20;
const TRACKING_END_FRAME = 180;

const AuthCode: FC<IProps> = ({
  authPhoneNumber, authIsLoading, authError, setAuthCode, returnToAuthPhoneNumber, clearAuthError,
}) => {
  const [code, setCode] = useState(undefined);
  const [idleMonkeyData, setIdleMonkeyData] = useState(undefined);
  const [trackingMonkeyData, setTrackingMonkeyData] = useState(undefined);
  const [isFirstMonkeyLoaded, setIsFirstMonkeyLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingDirection, setTrackingDirection] = useState(1);

  useEffect(() => {
    if (!idleMonkeyData) {
      getMonkeyAnimationData('MonkeyIdle').then(setIdleMonkeyData);
    }
  }, [idleMonkeyData]);

  useEffect(() => {
    if (!trackingMonkeyData) {
      getMonkeyAnimationData('MonkeyTracking').then(setTrackingMonkeyData);
    }
  }, [trackingMonkeyData]);

  const handleFirstMonkeyLoad = useCallback(() => setIsFirstMonkeyLoaded(true), []);

  function onCodeChange(e: FormEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    const { currentTarget: target } = e;

    target.value = target.value.replace(/[^\d]+/, '').substr(0, CODE_LENGTH);

    if (!isTracking) {
      setIsTracking(true);
    } else if (!target.value.length) {
      setIsTracking(false);
    }

    if (code && code.length > target.value.length) {
      setTrackingDirection(-1);
    } else {
      setTrackingDirection(1);
    }
    setCode(target.value);
    if (target.value.length === CODE_LENGTH) {
      setAuthCode({ code: target.value });
    }
  }

  function getTrackingFrames() {
    const startFrame = (code && code.length > 1) || trackingDirection < 0
      ? TRACKING_START_FRAME + TRACKING_FRAMES_PER_SYMBOL * (code.length - 1)
      : 0;
    const endFrame = code.length === CODE_LENGTH
      ? TRACKING_END_FRAME
      : TRACKING_START_FRAME + TRACKING_FRAMES_PER_SYMBOL * code.length;

    if (trackingDirection < 1) {
      return [
        endFrame,
        startFrame,
      ];
    }

    return [
      startFrame,
      endFrame,
    ];
  }

  return (
    <div id="auth-code-form" className="auth-form">
      <div id="monkey">
        {!isFirstMonkeyLoaded && (
          <div className="monkey-preview" />
        )}
        {idleMonkeyData && (
          <AnimatedSticker
            className={`${isTracking ? 'hidden' : ''}`}
            animationData={idleMonkeyData}
            play
            noLoop={isTracking}
            onLoad={handleFirstMonkeyLoad}
          />
        )}
        {trackingMonkeyData && (
          <AnimatedSticker
            className={!isTracking ? 'hidden' : 'shown'}
            animationData={trackingMonkeyData}
            play={isTracking}
            playSegment={isTracking && getTrackingFrames()}
            speed={2}
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
