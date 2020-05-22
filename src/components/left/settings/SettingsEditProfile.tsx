import { ChangeEvent } from 'react';
import React, {
  FC, useState, useCallback, memo,
} from '../../../lib/teact/teact';

import AvatarEditable from '../../ui/AvatarEditable';
import FloatingActionButton from '../../ui/FloatingActionButton';
import Spinner from '../../ui/Spinner';
import InputText from '../../ui/InputText';

const SettingsEditProfile: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const [, setPhoto] = useState<File | undefined>();
  const [firstName, setFirstName] = useState('Doge');
  const [lastName, setLastName] = useState('Dogenson');
  const [bio, setBio] = useState('');
  const [userName, setUserName] = useState('');

  const handlePhotoChange = useCallback((newPhoto: File) => {
    setPhoto(newPhoto);
    setIsTouched(true);
  }, []);

  const handleFirstNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    setIsTouched(true);
  }, []);

  const handleLastNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    setIsTouched(true);
  }, []);

  const handleBioChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value);
    setIsTouched(true);
  }, []);

  const handleUserNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setIsTouched(true);
  }, []);

  // TODO: @mockup
  const handleProfileSave = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsTouched(false);
    }, 1000);
  }, []);

  return (
    <div className="settings-fab-wrapper">
      <div className="settings-content custom-scroll">
        <div className="settings-edit-profile">
          <AvatarEditable
            onChange={handlePhotoChange}
            title="Edit your profile photo"
          />
          <InputText
            value={firstName}
            onChange={handleFirstNameChange}
            label="Name"
          />
          <InputText
            value={lastName}
            onChange={handleLastNameChange}
            label="Last Name"
          />
          <InputText
            value={bio}
            onChange={handleBioChange}
            label="Bio (optional)"
          />

          <p className="settings-item-description">
            Any details such as age, occupation or city. Example:<br />
            23 y.o. designer from San Francisco.
          </p>
        </div>

        <div className="settings-item">
          <h4 className="settings-item-header">Username</h4>

          <InputText
            value={userName}
            onChange={handleUserNameChange}
            label="Username (optional)"
          />

          <p className="settings-item-description">
            You can choose a username on Telegram. If you do, other people will be able to find you
            by this username and contact you without knowing your phone number.
          </p>

          <p className="settings-item-description">
            You can use a-z, 0-9 and underscores. Minimum length is 5 characters
          </p>
          {userName && (
            <p className="settings-item-description">
              This link opens a chat with you:<br />
              <span className="username-link">https://t.me/{userName}</span>
            </p>
          )}
        </div>
      </div>

      <FloatingActionButton
        show={isTouched}
        onClick={handleProfileSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner color="white" />
        ) : (
          <i className="icon-check" />
        )}
      </FloatingActionButton>
    </div>
  );
};

export default memo(SettingsEditProfile);
