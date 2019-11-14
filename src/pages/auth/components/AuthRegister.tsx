import { ChangeEvent } from 'react';
import { DispatchMap, withGlobal } from '../../../lib/teactn';

import React, { FC, useState } from '../../../lib/teact';
// import { DispatchMap, withGlobal } from '../../../lib/teactn';

import Button from '../../../components/ui/Button';
import InputText from '../../../components/ui/InputText';

import './Auth.scss';

type IProps = Pick<DispatchMap, 'signUp'>;

const AuthRegister: FC<IProps> = ({ signUp }) => {
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatar, setAvatar] = useState(undefined);

  function onFirstNameChange(event: ChangeEvent<HTMLInputElement>) {
    const { target } = event;

    setFirstName(target.value);
    setIsButtonShown(target.value.length > 0);
  }

  function onLastNameChange(event: ChangeEvent<HTMLInputElement>) {
    const { target } = event;

    setLastName(target.value);
  }

  function openFileSelector() {
    const fileInput = document.getElementById('registration-avatar');
    if (fileInput) {
      fileInput.click();
    }
  }

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;

    if (!target || !target.files) {
      return;
    }

    const imgFile = target.files[0];
    const imgExt = imgFile.name.split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    if (
      !imgExt
      || !allowedExtensions.includes(imgExt)
      || !imgFile.type.startsWith('image/')
    ) {
      return;
    }

    setAvatar(imgFile);
    const previousImg = document.querySelector('#avatar img');
    if (previousImg) {
      previousImg.remove();
    }
    const img = document.createElement('img');
    const avatarContainer = document.querySelector('#avatar');
    if (!avatarContainer) {
      return;
    }
    avatarContainer.appendChild(img);

    const reader = new FileReader();
    reader.onload = ((aImg) => (e: ProgressEvent<FileReader>) => {
      const { target: eTarget } = e;
      if (!eTarget || typeof eTarget.result !== 'string') {
        return;
      }
      aImg.src = eTarget.result;
    })(img);
    reader.readAsDataURL(imgFile);
  }

  function handleSubmit() {
    signUp({ firstName, lastName });
  }

  return (
    <div id="auth-registration-form" className="auth-form">
      <form action="" method="post" onSubmit={handleSubmit}>
        <div
          id="avatar"
          onClick={openFileSelector}
          className={avatar ? 'filled' : ''}
          role="button"
          tabIndex={0}
          title="Change your profile picture"
        >
          <input type="file" id="registration-avatar" onChange={onAvatarChange} accept="image/png, image/jpeg" />
          <i className="icon-camera-add" />
        </div>
        <h2>Your Name</h2>
        <p className="note">
          Enter your name and add
          <br />a profile picture.
        </p>
        <InputText
          id="registration-first-name"
          label="Name"
          onChange={onFirstNameChange}
          value={firstName}
        />
        <InputText
          id="registration-last-name"
          label="Last Name (optional)"
          onChange={onLastNameChange}
          value={lastName}
        />
        {isButtonShown && (
          <Button type="submit">Start Messaging</Button>
        )}
      </form>
    </div>
  );
};

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { signUp } = actions;
    return { signUp };
  },
)(AuthRegister);
