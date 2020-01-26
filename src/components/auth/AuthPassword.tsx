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

const AuthPassword: FC<IProps> = ({
  authIsLoading, authError, setAuthPassword, clearAuthError,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [peekMonkeyData, setPeekMonkeyData] = useState(undefined);
  const [isShownAsync, setIsShownAsync] = useState(false);

  useEffect(() => {
    if (!peekMonkeyData) {
      getMonkeyAnimationData('MonkeyPeek').then(setPeekMonkeyData);
    } else {
      setIsShownAsync(true);
    }
  }, [peekMonkeyData]);

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    const { target } = e;
    setPassword(target.value);
    setIsButtonShown(target.value.length > 4);
  }

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authIsLoading) {
      return;
    }

    setAuthPassword({ password });
  }

  return (
    <div id="auth-code-form" className="auth-form">
      <div id="monkey">
        {peekMonkeyData && (
          <AnimatedSticker
            className={isShownAsync ? 'shown' : ''}
            animationData={peekMonkeyData}
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
