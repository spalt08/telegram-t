import { ChangeEvent } from 'react';
import React, { FC, useState } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../global/types';

import Button from '../ui/Button';
import InputText from '../ui/InputText';
import CropModal from './CropModal';

type StateProps = Pick<GlobalState, 'authIsLoading' | 'authError'>;
type DispatchProps = Pick<GlobalActions, 'signUp' | 'clearAuthError' | 'uploadProfilePhoto'>;

const AuthRegister: FC<StateProps & DispatchProps> = ({
  authIsLoading, authError, signUp, clearAuthError, uploadProfilePhoto,
}) => {
  const [isButtonShown, setIsButtonShown] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [croppedFile, setCroppedFile] = useState();
  const [croppedBlobUrl, setCroppedBlobUrl] = useState();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleSelectFile(event: ChangeEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;

    if (!target || !target.files || !target.files[0]) {
      return;
    }

    setSelectedFile(target.files[0]);
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

  function handleAvatarCrop(croppedImg: File) {
    setSelectedFile(undefined);
    setCroppedFile(croppedImg);

    if (croppedBlobUrl) {
      URL.revokeObjectURL(croppedBlobUrl);
    }
    setCroppedBlobUrl(URL.createObjectURL(croppedImg));
  }

  function handleModalClose() {
    setSelectedFile(undefined);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    signUp({ firstName, lastName });

    if (croppedFile) {
      uploadProfilePhoto({ file: croppedFile });
    }
  }

  return (
    <div id="auth-registration-form" className="auth-form">
      <form action="" method="post" onSubmit={handleSubmit}>
        <label
          id="avatar"
          className={croppedBlobUrl ? 'filled' : ''}
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
          {croppedBlobUrl && <img src={croppedBlobUrl} alt="Avatar" />}
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
        <CropModal file={selectedFile} onClose={handleModalClose} onChange={handleAvatarCrop} />
      </form>
    </div>
  );
};

export default withGlobal(
  (global): StateProps => {
    const { authIsLoading, authError } = global;
    return { authIsLoading, authError };
  },
  (setGlobal, actions): DispatchProps => {
    const { signUp, clearAuthError, uploadProfilePhoto } = actions;
    return { signUp, clearAuthError, uploadProfilePhoto };
  },
)(AuthRegister);
