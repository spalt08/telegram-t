import { ChangeEvent } from 'react';

import React, { FC, useState } from '../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../lib/teactn';

import Button from '../../../components/ui/Button';
import InputText from '../../../components/ui/InputText';
import Select from '../../../components/ui/Select';

import './Auth.scss';

type IProps = Pick<DispatchMap, 'setAuthPhoneNumber'>;

const AuthPhoneNumber: FC<IProps> = ({ setAuthPhoneNumber }) => {
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [code, setCode] = useState('+7');
  const [phone, setPhone] = useState('');

  function onCodeChange(e: ChangeEvent<HTMLSelectElement>) {
    const { target } = e;

    setCode(target.value);
  }

  function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e;

    target.value = target.value.replace(/[^\d]+/g, '');

    setPhone(target.value);
    setIsButtonShown(target.value.length === 10);
  }

  function handleSubmit() {
    const phoneNumber = `${code}${phone}`;
    setAuthPhoneNumber({ phoneNumber });
  }

  return (
    <div id="auth-phone-number-form" className="auth-form">
      <div id="logo" />
      <h2>Sign in to Telegram</h2>
      <p className="note">
        Please confirm your country and
        <br />enter your phone number.
      </p>
      <Select
        id="sign-in-phone-code"
        label="Country"
        value={code}
        onChange={onCodeChange}
      >
        <option value="+7">Russia +7</option>
      </Select>
      <InputText
        id="sign-in-phone-number"
        label="Phone Number"
        onChange={onPhoneNumberChange}
        value={phone}
      />
      {isButtonShown && (
        <Button onClick={handleSubmit}>NEXT</Button>
      )}
    </div>
  );
};

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { setAuthPhoneNumber } = actions;
    return { setAuthPhoneNumber };
  },
)(AuthPhoneNumber);
