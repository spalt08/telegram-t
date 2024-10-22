import { FormEvent } from 'react';
import React, {
  FC, useState, useEffect, useCallback, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalState, GlobalActions } from '../../global/types';

import getAnimationData from '../common/helpers/animatedAssets';
import { pick } from '../../util/iteratees';

import InputText from '../ui/InputText';
import Loading from '../ui/Loading';

import AnimatedSticker from '../common/AnimatedSticker';

type StateProps = Pick<GlobalState, 'authPhoneNumber' | 'authIsLoading' | 'authError'>;
type DispatchProps = Pick<GlobalActions, 'setAuthCode' | 'returnToAuthPhoneNumber' | 'clearAuthError'>;

const CODE_LENGTH = 5;
const TRACKING_START_FRAME = 15;
const TRACKING_FRAMES_PER_SYMBOL = 20;
const TRACKING_END_FRAME = 180;

const AuthCode: FC<StateProps & DispatchProps> = ({
  authPhoneNumber, authIsLoading, authError, setAuthCode, returnToAuthPhoneNumber, clearAuthError,
}) => {
  const [code, setCode] = useState<string>();
  const [idleMonkeyData, setIdleMonkeyData] = useState<Record<string, any>>();
  const [trackingMonkeyData, setTrackingMonkeyData] = useState<Record<string, any>>();
  const [isFirstMonkeyLoaded, setIsFirstMonkeyLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingDirection, setTrackingDirection] = useState(1);

  useEffect(() => {
    if (!idleMonkeyData) {
      getAnimationData('MonkeyIdle').then(setIdleMonkeyData);
    }
  }, [idleMonkeyData]);

  useEffect(() => {
    if (!trackingMonkeyData) {
      getAnimationData('MonkeyTracking').then(setTrackingMonkeyData);
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

  function getTrackingFrames(): [number, number] {
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
            playSegment={isTracking ? getTrackingFrames() : undefined}
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
        autoComplete="one-time-code"
        inputMode="decimal"
      />
      {authIsLoading && <Loading />}
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => pick(global, ['authPhoneNumber', 'authIsLoading', 'authError']),
  (setGlobal, actions): DispatchProps => pick(actions, ['setAuthCode', 'returnToAuthPhoneNumber', 'clearAuthError']),
)(AuthCode));
