import { ChangeEvent } from 'react';

import React, { FC, useState } from '../../../lib/teact';
import { DispatchMap, GlobalState, withGlobal } from '../../../lib/teactn';

import InputText from '../../../components/ui/InputText';

// @ts-ignore
import monkeyCode from '../../../assets/monkey_code.png';
// @ts-ignore
import monkeyCodeInvalid from '../../../assets/monkey_code_invalid.png';
import './Auth.scss';

type IProps = Pick<GlobalState, 'authPhoneNumber' | 'authError'> &
Pick<DispatchMap, 'setAuthCode' | 'returnToAuthPhoneNumber'>;
const AuthCode: FC<IProps> = ({
  authPhoneNumber, authError, setAuthCode, returnToAuthPhoneNumber,
}) => {
  const [code, setCode] = useState(undefined);

  function onCodeChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e;

    target.value = target.value.replace(/[^\d]+/, '').substr(0, 5);

    setCode(target.value);
    if (target.value.length === 5) {
      setAuthCode({ code: target.value });
    }
  }

  return (
    <div id="auth-code-form" className="auth-form">
      <div id="monkey">
        <img src={monkeyCode} className={!authError ? 'shown' : ''} alt="" />
        <img src={monkeyCodeInvalid} className={authError ? 'shown' : ''} alt="" />
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
        onChange={onCodeChange}
        value={code}
        error={authError}
      />
    </div>
  );
};

export default withGlobal(
  global => {
    const { authPhoneNumber, authError } = global;
    return { authPhoneNumber, authError };
  },
  (setGlobal, actions) => {
    const { setAuthCode, returnToAuthPhoneNumber } = actions;
    return { setAuthCode, returnToAuthPhoneNumber };
  },
)(AuthCode);
