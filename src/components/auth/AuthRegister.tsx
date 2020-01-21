import { ChangeEvent } from 'react';
import React, { FC, useState } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../store/types';

import { insertImage } from '../../util/image';
import Button from '../ui/Button';
import InputText from '../ui/InputText';
import CropModal from './CropModal';

import './Auth.scss';

type IProps = Pick<GlobalState, 'authIsLoading' | 'authError'> & Pick<GlobalActions, 'signUp' | 'clearAuthError'>;

const AuthRegister: FC<IProps> = ({
  authIsLoading, authError, signUp, clearAuthError,
}) => {
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [avatar, setAvatar] = useState(undefined);
  const [selectedFile, setSelectedFile] = useState(undefined);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleSelectFile(event: ChangeEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;

    if (!target || !target.files || !target.files[0]) {
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

    setSelectedFile(imgFile);
    target.value = '';
  }

  function handleFirstNameChange(event: ChangeEvent<HTMLInputElement>) {
    if (authError) {
      clearAuthError();
    }

    const { target } = event;

    setFirstName(target.value);
    setIsButtonShown(target.value.length > 0);
  }

  function handleLastNameChange(event: ChangeEvent<HTMLInputElement>) {
    const { target } = event;

    setLastName(target.value);
  }

  async function handleAvatarCrop(croppedImg: File) {
    setSelectedFile(null);
    setAvatar(croppedImg);

    await insertImage(croppedImg, 'avatar');
  }

  function handleModalDismiss() {
    setSelectedFile(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    signUp({ firstName, lastName });
  }

  return (
    <div id="auth-registration-form" className="auth-form">
      <form action="" method="post" onSubmit={handleSubmit}>
        <label
          id="avatar"
          className={avatar ? 'filled' : ''}
          role="button"
          tabIndex={0}
          title="Change your profile picture"
        >
          <input
            type="file"
            id="registration-avatar"
            onChange={handleSelectFile}
            accept="image/png, image/jpeg"
          />
          <i className="icon-camera-add" />
        </label>
        <h2>Your Name</h2>
        <p className="note">
          Enter your name and add
          <br />a profile picture.
        </p>
        <InputText
          id="registration-first-name"
          label="Name"
          onChange={handleFirstNameChange}
          value={firstName}
          error={authError}
        />
        <InputText
          id="registration-last-name"
          label="Last Name (optional)"
          onChange={handleLastNameChange}
          value={lastName}
        />
        {isButtonShown && (
          <Button type="submit" isLoading={authIsLoading}>Start Messaging</Button>
        )}
        <CropModal file={selectedFile} onDismiss={handleModalDismiss} onChange={handleAvatarCrop} />
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
    const { signUp, clearAuthError } = actions;
    return { signUp, clearAuthError };
  },
)(AuthRegister);
