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

  function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e;

    target.value = target.value.replace(/[^\d]+/g, '');

    setIsButtonShown(target.value.length === 10);
  }

  function handleSubmit() {
    // TODO ref
    const codeInput = document.getElementById('sign-in-phone-code') as HTMLSelectElement;
    const numberInput = document.getElementById('sign-in-phone-number') as HTMLInputElement;
    const phoneNumber = `${codeInput.value}${numberInput.value}`;
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
      <Select id="sign-in-phone-code">
        <option value="+7">Russia +7</option>
      </Select>
      <InputText id="sign-in-phone-number" placeholder="Phone Number" onChange={onPhoneNumberChange} />
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
