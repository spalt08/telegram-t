import { ChangeEvent } from 'react';
import React, {
  FC, useState, useEffect, useCallback,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../global/types';

import getMonkeyAnimationData from '../../util/monkeys';
import InputPassword from '../ui/InputPassword';
import Button from '../ui/Button';
import AnimatedSticker from '../common/AnimatedSticker';

type IProps = (
  Pick<GlobalState, 'authIsLoading' | 'authError'>
  & Pick<GlobalActions, 'setAuthPassword' | 'clearAuthError'>
);

const MIN_PASSWORD_LENGTH = 3;
const PEEK_MONKEY_SHOW_DELAY = 700;
const SEGMENT_COVER_EYES = [0, 50];
const SEGMENT_UNCOVER_EYE = [0, 20];
const SEGMENT_COVER_EYE = [20, 0];

const AuthPassword: FC<IProps> = ({
  authIsLoading, authError, setAuthPassword, clearAuthError,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [closeMonkeyData, setCloseMonkeyData] = useState(undefined);
  const [peekMonkeyData, setPeekMonkeyData] = useState(undefined);
  const [isFirstMonkeyLoaded, setIsFirstMonkeyLoaded] = useState(false);
  const [isPeekShown, setIsPeekShown] = useState(false);

  useEffect(() => {
    if (!closeMonkeyData) {
      getMonkeyAnimationData('MonkeyClose').then(setCloseMonkeyData);
    } else {
      setTimeout(() => setIsPeekShown(true), PEEK_MONKEY_SHOW_DELAY);
    }
  }, [closeMonkeyData]);

  useEffect(() => {
    if (!peekMonkeyData) {
      getMonkeyAnimationData('MonkeyPeek').then(setPeekMonkeyData);
    }
  }, [peekMonkeyData]);

  const handleFirstMonkeyLoad = useCallback(() => setIsFirstMonkeyLoaded(true), []);

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    const { target } = e;
    setPassword(target.value);
    setCanSubmit(target.value.length >= MIN_PASSWORD_LENGTH);
  }

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authIsLoading) {
      return;
    }

    if (canSubmit) {
      setAuthPassword({ password });
    }
  }

  return (
    <div id="auth-code-form" className="auth-form">
      <div id="monkey">
        {!isFirstMonkeyLoaded && (
          <div className="monkey-preview" />
        )}
        {closeMonkeyData && (
          <AnimatedSticker
            className={isPeekShown ? 'hidden' : 'shown'}
            animationData={closeMonkeyData}
            playSegment={SEGMENT_COVER_EYES}
            noLoop
            onLoad={handleFirstMonkeyLoad}
          />
        )}
        {peekMonkeyData && (
          <AnimatedSticker
            className={isPeekShown ? 'shown' : 'hidden'}
            animationData={peekMonkeyData}
            playSegment={showPassword ? SEGMENT_UNCOVER_EYE : SEGMENT_COVER_EYE}
            noLoop
          />
        )}
      </div>
      <h2>Enter a Password</h2>
      <p className="note">
        Your account is protected with
        <br />an additional password.
      </p>
      <form action="" onSubmit={handleSubmit}>
        <InputPassword
          id="sign-in-password"
          showPassword={showPassword}
          onChange={onPasswordChange}
          onShowToggle={togglePasswordVisibility}
          value={password}
          error={authError}
        />
        {canSubmit && (
          <Button type="submit" isLoading={authIsLoading}>Next</Button>
        )}
      </form>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { authIsLoading, authError } = global;
    return { authIsLoading, authError };
  },
  (setGlobal, actions) => {
    const { setAuthPassword, clearAuthError } = actions;
    return { setAuthPassword, clearAuthError };
  },
)(AuthPassword);
