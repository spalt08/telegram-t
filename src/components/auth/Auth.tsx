import { ChangeEvent } from 'react';

import React, { useState } from '../../lib/reactt';
import Button from '../ui/Button';
import './Auth.scss';
import InputText from '../ui/InputText';
import Select from '../ui/Select';

const Auth = () => {
  const [isButtonShown, setIsButtonShown] = useState(false);

  function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const target = e.target;

    target.value = target.value.replace(/[^\d]+/, '');

    setIsButtonShown(target.value.length === 10);
  }

  return (
    <div id="sign-in-form">
      <div id="logo" />
      <h2>Sign in to Telegram</h2>
      <div className="note">
        Please confirm your country and
        <br/>enter phone number
      </div>
      <div>
        <Select>
          <option value="0">Russia +7</option>
        </Select>
      </div>
      <div>
        <InputText placeholder="Phone Number" onChange={onPhoneNumberChange} />
      </div>
      <div>
        {isButtonShown && (
          <Button>NEXT</Button>
        )}
      </div>
    </div>
  );
};

export default Auth;
