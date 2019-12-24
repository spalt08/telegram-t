import { ChangeEvent } from 'react';
import React, { FC, useState, useEffect } from '../../../lib/teact';
import { withGlobal } from '../../../lib/teactn';

import { GlobalState, GlobalActions } from '../../../store/types';
import InputPassword from '../../../components/ui/InputPassword';
import Button from '../../../components/ui/Button';
import AnimatedSticker from '../../../components/AnimatedSticker';
import getAnimationDataFromFile from '../../../util/getAnimationDataFromFile';

import MonkeyPeek from '../../../assets/TwoFactorSetupMonkeyClose.tgs';

import './Auth.scss';

type IProps = Pick<GlobalState, 'authIsLoading' | 'authError'> & Pick<GlobalActions, 'setAuthPassword'>;

// TODO Support `authError`.
const AuthPassword: FC<IProps> = ({ authIsLoading, authError, setAuthPassword }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [peekMonkey, setPeekMonkey] = useState(undefined);

  useEffect(() => {
    if (!peekMonkey) {
      getAnimationDataFromFile(MonkeyPeek).then(setPeekMonkey);
    }
  }, [peekMonkey]);

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
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
        {peekMonkey && (
          <AnimatedSticker
            id="monkey-tracking"
            animationData={peekMonkey}
            play={false}
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
    const { setAuthPassword } = actions;
    return { setAuthPassword };
  },
)(AuthPassword);
