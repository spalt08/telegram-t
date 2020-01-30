import { ChangeEvent } from 'react';
import React, { FC, useState, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../store/types';

import getMonkeyAnimationData from '../../util/monkeys';
import InputPassword from '../ui/InputPassword';
import Button from '../ui/Button';
import AnimatedSticker from '../common/AnimatedSticker';

type IProps = (
  Pick<GlobalState, 'authIsLoading' | 'authError'>
  & Pick<GlobalActions, 'setAuthPassword' | 'clearAuthError'>
);

const PEEK_MONKEY_SHOW_DELAY = 900;
const CLOSE_HANDS_FRAME = 50;
const PEEK_OPEN_FRAME = 20;

const AuthPassword: FC<IProps> = ({
  authIsLoading, authError, setAuthPassword, clearAuthError,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [closeMonkeyData, setCloseMonkeyData] = useState(undefined);
  const [peekMonkeyData, setPeekMonkeyData] = useState(undefined);
  const [isCloseShownAsync, setIsCloseShownAsync] = useState(false);
  const [isPeekShown, setIsPeekShown] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    if (!closeMonkeyData) {
      getMonkeyAnimationData('MonkeyClose').then(setCloseMonkeyData);
    } else {
      setIsCloseShownAsync(true);
    }
  }, [closeMonkeyData]);

  useEffect(() => {
    if (!peekMonkeyData) {
      getMonkeyAnimationData('MonkeyPeek').then(setPeekMonkeyData);
    }
  }, [peekMonkeyData]);

  useEffect(() => {
    if (isCloseShownAsync) {
      setTimeout(() => setIsPeekShown(true), PEEK_MONKEY_SHOW_DELAY);
    }
  }, [isCloseShownAsync]);

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    const { target } = e;
    setPassword(target.value);
    setIsButtonShown(target.value.length > 4);
  }

  function togglePasswordVisibility() {
    if (!canAnimate) {
      setCanAnimate(true);
    }
    setShowPassword(!showPassword);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authIsLoading) {
      return;
    }

    setAuthPassword({ password });
  }

  function getPeekFrames() {
    return showPassword
      ? [0, PEEK_OPEN_FRAME]
      : [PEEK_OPEN_FRAME, 0];
  }

  return (
    <div id="auth-code-form" className="auth-form">
      <div id="monkey">
        {closeMonkeyData && (
          <AnimatedSticker
            className={isCloseShownAsync ? 'shown' : ''}
            animationData={closeMonkeyData}
            playSegment={[0, CLOSE_HANDS_FRAME]}
            noLoop
          />
        )}
        {peekMonkeyData && (
          <AnimatedSticker
            className={isPeekShown ? 'shown' : 'hidden'}
            animationData={peekMonkeyData}
            playSegment={canAnimate && getPeekFrames()}
            noLoop
          />
        )}
      </div>
      <h2>Enter a Password</h2>
      <p className="note">
        Your account is protected with
        <br />an additional password.
      </p>
      <form action="" method="post" onSubmit={handleSubmit}>
        <InputPassword
          id="sign-in-password"
          showPassword={showPassword}
          onChange={onPasswordChange}
          onShowToggle={togglePasswordVisibility}
          value={password}
          error={authError}
        />
        {isButtonShown && (
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
