import { ChangeEvent } from 'react';

import React, { FC, useState } from '../../../lib/reactt';
import { DispatchMap, withGlobal } from '../../../lib/reactnt';

import Button from '../../../components/ui/Button';
import InputText from '../../../components/ui/InputText';
import Select from '../../../components/ui/Select';

import './AuthPhoneNumber.scss';

type IProps = Pick<DispatchMap, 'setAuthPhoneNumber'>;

const AuthPhoneNumber: FC<IProps> = ({ setAuthPhoneNumber }: IProps) => {
  const [isButtonShown, setIsButtonShown] = useState(false);

  function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const target = e.target;

    target.value = target.value.replace(/[^\d]+/, '');

    setIsButtonShown(target.value.length === 10);
  }

  function handleSubmit() {
    const codeInput = document.getElementById('sign-in-phone-code') as HTMLSelectElement;
    const numberInput = document.getElementById('sign-in-phone-number') as HTMLInputElement;
    const phoneNumber = `${codeInput.value}${numberInput.value}`;
    setAuthPhoneNumber({ phoneNumber });
  }

  return (
    <div id="auth-phone-number-form">
      <div id="logo" />
      <h2>Sign in to Telegram</h2>
      <div className="note">
        Please confirm your country and
        <br />enter phone number.
      </div>
      <div>
        <Select id="sign-in-phone-code">
          <option value="+7">Russia +7</option>
        </Select>
      </div>
      <div>
        <InputText id="sign-in-phone-number" placeholder="Phone Number" onChange={onPhoneNumberChange} />
      </div>
      <div>
        {isButtonShown && (
          <Button onClick={handleSubmit}>NEXT</Button>
        )}
      </div>
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
