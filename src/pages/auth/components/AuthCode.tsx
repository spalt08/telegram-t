import { ChangeEvent } from 'react';

import React, { FC, useState } from '../../../lib/teact';
import { DispatchMap, GlobalState, withGlobal } from '../../../lib/teactn';

import InputText from '../../../components/ui/InputText';

import monkeyCode from '../../../assets/monkey_code.png';
import monkeyCodeInvalid from '../../../assets/monkey_code_invalid.png';
import './Auth.scss';

type IProps = Pick<GlobalState, 'authPhoneNumber'> & Pick<DispatchMap, 'setAuthCode'> & {
  error?: string;
};

const AuthCode: FC<IProps> = ({ authPhoneNumber, setAuthCode, error }) => {
  const [code, setCode] = useState(undefined);

  function onCodeChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e;

    target.value = target.value.replace(/[^\d]+/, '').substr(0, 5);

    setCode(target.value);
    if (target.value.length === 5) {
      setAuthCode({ code: target.value });
    }
  }

  function returnToAuthPhoneNumber() {
    // TODO @not-implented
  }

  return (
    <div id="auth-code-form" className="auth-form">
      <div id="monkey">
        <img src={monkeyCode} className={!error ? 'shown' : ''} alt="" />
        <img src={monkeyCodeInvalid} className={error ? 'shown' : ''} alt="" />
      </div>
      <h2>
        {authPhoneNumber}
        <div
          className="auth-number-edit"
          onClick={returnToAuthPhoneNumber}
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
        error={error}
      />
    </div>
  );
};

export default withGlobal(
  global => {
    const { authPhoneNumber } = global;
    return { authPhoneNumber };
  },
  (setGlobal, actions) => {
    const { setAuthCode } = actions;
    return { setAuthCode };
  },
)(AuthCode);
