import { ChangeEvent } from 'react';

import React, { FC, Props, useState, VirtualElementComponent } from '../../../lib/reactt';
import Button from '../../ui/Button';
import './Auth.scss';
import InputText from '../../ui/InputText';
import Select from '../../ui/Select';

interface IProps extends Props{
  isInitialized: boolean;
  signIn: Function;
  signOut: Function;
}

const Auth: FC<IProps> = ({ signIn, signOut, isInitialized }: IProps): VirtualElementComponent => {
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
        <br />enter phone number
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
        {isInitialized ? (
          <div>
            INITIALIZED!
            <Button onClick={signOut}>BACK</Button>
          </div>
        ) : (
          isButtonShown && (
            <Button onClick={signIn}>NEXT</Button>
          )
        )}
      </div>
    </div>
  );
};

export default Auth;
