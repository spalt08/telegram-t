import { ChangeEvent } from 'react';
import React, {
  FC, useState, useCallback, memo, useEffect, useMemo, useRef,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiMediaFormat } from '../../../api/types';
import { GlobalActions } from '../../../global/types';
import { ProfileEditProgress } from '../../../types';

import { throttle, debounce } from '../../../util/schedulers';
import { pick } from '../../../util/iteratees';
import buildClassName from '../../../util/buildClassName';
import getElementHasScroll from '../../../util/getElementHasScroll';
import { selectUser } from '../../../modules/selectors';
import { getChatAvatarHash } from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';
import useUpdateOnResize from '../../../hooks/useUpdateOnResize';

import AvatarEditable from '../../ui/AvatarEditable';
import FloatingActionButton from '../../ui/FloatingActionButton';
import Spinner from '../../ui/Spinner';
import InputText from '../../ui/InputText';

type StateProps = {
  currentAvatarHash?: string;
  currentFirstName?: string;
  currentLastName?: string;
  currentBio?: string;
  currentUsername?: string;
  progress?: ProfileEditProgress;
  isUsernameAvailable?: boolean;
};

type DispatchProps = Pick<GlobalActions, (
  'loadCurrentUser' | 'updateProfile' | 'checkUsername'
)>;

const runThrottled = throttle((cb) => cb(), 60000, true);
const runDebouncedForCheckUsername = debounce((cb) => cb(), 250, false);

const MIN_USERNAME_LENGTH = 5;
const MAX_USERNAME_LENGTH = 32;
const USERNAME_REGEX = /^([a-zA-Z0-9_]+)$/;
const MAX_BIO_LENGTH = 70;

const ERROR_FIRST_NAME_MISSING = 'Please provide your first name';
const ERROR_BIO_TOO_LONG = 'Bio can\' be longer than 70 characters';

function isUsernameValid(username: string) {
  const trimmedUsername = username.trim();
  return trimmedUsername.length >= MIN_USERNAME_LENGTH
    && trimmedUsername.length <= MAX_USERNAME_LENGTH
    && USERNAME_REGEX.test(trimmedUsername);
}

const SettingsEditProfile: FC<StateProps & DispatchProps> = ({
  currentAvatarHash,
  currentFirstName,
  currentLastName,
  currentBio,
  currentUsername,
  progress,
  isUsernameAvailable,
  loadCurrentUser,
  updateProfile,
  checkUsername,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>();

  const [isUsernameTouched, setIsUsernameTouched] = useState(false);
  const [isProfileFieldsTouched, setIsProfileFieldsTouched] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [photo, setPhoto] = useState<File | undefined>();
  const [firstName, setFirstName] = useState(currentFirstName || '');
  const [lastName, setLastName] = useState(currentLastName || '');
  const [bio, setBio] = useState(currentBio || '');
  const [username, setUsername] = useState(currentUsername || '');

  const currentAvatarBlobUrl = useMedia(currentAvatarHash, false, ApiMediaFormat.BlobUrl);

  useUpdateOnResize();

  const isSaveButtonShown = useMemo(() => {
    if (isUsernameTouched && (!isUsernameAvailable || !isUsernameValid(username))) {
      return false;
    }

    return Boolean(photo) || isProfileFieldsTouched || isUsernameAvailable === true;
  }, [isProfileFieldsTouched, isUsernameTouched, isUsernameAvailable, photo, username]);

  const isLoading = progress === ProfileEditProgress.InProgress;

  const [usernameSuccess, usernameError] = useMemo(() => {
    const trimmedUsername = username.trim();

    if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
      return [undefined, 'Username is too short'];
    }
    if (trimmedUsername.length > MAX_USERNAME_LENGTH) {
      return [undefined, 'Username is too long'];
    }
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      return [undefined, 'Username contains invalid characters'];
    }

    if (isUsernameAvailable === undefined) {
      return [];
    }

    return [
      isUsernameAvailable ? 'Username is available' : undefined,
      isUsernameAvailable === false ? 'Username is already taken' : undefined,
    ];
  }, [username, isUsernameAvailable]);

  // Due to the parent Transition, this component never gets unmounted,
  // that's why we use throttled API call on every update.
  useEffect(() => {
    runThrottled(() => {
      loadCurrentUser();
    });
  }, [loadCurrentUser]);

  useEffect(() => {
    setPhoto(undefined);
  }, [currentAvatarBlobUrl]);

  useEffect(() => {
    setFirstName(currentFirstName || '');
    setLastName(currentLastName || '');
    setBio(currentBio || '');
  }, [currentFirstName, currentLastName, currentBio]);

  useEffect(() => {
    setUsername(currentUsername || '');
  }, [currentUsername]);

  useEffect(() => {
    if (progress === ProfileEditProgress.Complete) {
      setIsProfileFieldsTouched(false);
      setIsUsernameTouched(false);
      setError(undefined);
    }
  }, [progress]);

  const handlePhotoChange = useCallback((newPhoto: File) => {
    setPhoto(newPhoto);
  }, []);

  const handleFirstNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    setIsProfileFieldsTouched(true);
  }, []);

  const handleLastNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    setIsProfileFieldsTouched(true);
  }, []);

  const handleBioChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value);
    setIsProfileFieldsTouched(true);
  }, []);

  const handleUsernameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setIsUsernameTouched(true);

    if (isUsernameValid(newUsername)) {
      runDebouncedForCheckUsername(() => {
        checkUsername({ username: newUsername });
      });
    }
  }, [checkUsername]);

  const handleProfileSave = useCallback(() => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedBio = bio.trim();
    const trimmedUsername = username.trim();

    if (!trimmedFirstName.length) {
      setError(ERROR_FIRST_NAME_MISSING);
      return;
    }

    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setError(ERROR_BIO_TOO_LONG);
      return;
    }

    if (trimmedUsername.length && !isUsernameValid(trimmedUsername)) {
      return;
    }

    updateProfile({
      photo,
      ...(isProfileFieldsTouched && {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        bio: trimmedBio,
      }),
      ...(isUsernameTouched && {
        username: trimmedUsername,
      }),
    });
  }, [
    photo,
    firstName, lastName, bio, isProfileFieldsTouched,
    username, isUsernameTouched,
    updateProfile,
  ]);

  const className = buildClassName(
    'settings-fab-wrapper',
    scrollContainerRef.current ? getElementHasScroll(scrollContainerRef.current) && 'has-scroll' : undefined,
  );

  return (
    <div className={className}>
      <div ref={scrollContainerRef} className="settings-content custom-scroll">
        <div className="settings-edit-profile">
          <AvatarEditable
            currentAvatarBlobUrl={currentAvatarBlobUrl}
            onChange={handlePhotoChange}
            title="Edit your profile photo"
            disabled={isLoading}
          />
          <InputText
            value={firstName}
            onChange={handleFirstNameChange}
            label="Name"
            disabled={isLoading}
            error={error === ERROR_FIRST_NAME_MISSING ? error : undefined}
          />
          <InputText
            value={lastName}
            onChange={handleLastNameChange}
            label="Last Name"
            disabled={isLoading}
          />
          <InputText
            value={bio}
            onChange={handleBioChange}
            label="Bio (optional)"
            disabled={isLoading}
            error={error === ERROR_BIO_TOO_LONG ? error : undefined}
          />

          <p className="settings-item-description">
            Any details such as age, occupation or city. Example:<br />
            23 y.o. designer from San Francisco.
          </p>
        </div>

        <div className="settings-item">
          <h4 className="settings-item-header">Username</h4>

          <InputText
            value={username}
            onChange={handleUsernameChange}
            label="Username (optional)"
            error={usernameError}
            success={usernameSuccess}
            disabled={isLoading}
          />

          <p className="settings-item-description">
            You can choose a username on Telegram. If you do, other people will be able to find you
            by this username and contact you without knowing your phone number.
          </p>

          <p className="settings-item-description">
            You can use a-z, 0-9 and underscores. Minimum length is 5 characters
          </p>
          {username && !usernameError && (
            <p className="settings-item-description">
              This link opens a chat with you:<br />
              <span className="username-link">https://t.me/{username}</span>
            </p>
          )}
        </div>
      </div>

      <FloatingActionButton
        show={isSaveButtonShown}
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

export default memo(withGlobal(
  (global): StateProps => {
    const { currentUserId } = global;
    const { progress, isUsernameAvailable } = global.profileEdit || {};
    const currentUser = currentUserId ? selectUser(global, currentUserId) : undefined;

    if (!currentUser) {
      return {
        progress,
        isUsernameAvailable,
      };
    }

    const {
      firstName: currentFirstName,
      lastName: currentLastName,
      username: currentUsername,
      fullInfo,
    } = currentUser;
    const { bio: currentBio } = fullInfo || {};
    const currentAvatarHash = getChatAvatarHash(currentUser);

    return {
      currentAvatarHash,
      currentFirstName,
      currentLastName,
      currentBio,
      currentUsername,
      progress,
      isUsernameAvailable,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'loadCurrentUser',
    'updateProfile',
    'checkUsername',
  ]),
)(SettingsEditProfile));
