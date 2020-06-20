import React, { FC, memo, useCallback } from '../../../lib/teact/teact';

import { SettingsScreens } from '../../../types';

import useFoldersReducer from '../../../hooks/reducers/useFoldersReducer';

import Transition from '../../ui/Transition';

import SettingsHeader from './SettingsHeader';

import SettingsMain from './SettingsMain';
import SettingsEditProfile from './SettingsEditProfile';
import SettingsFolders from './folders/SettingsFolders';
import SettingsGeneral from './SettingsGeneral';
import SettingsGeneralChatBackground from './SettingsGeneralChatBackground';
import SettingsNotifications from './SettingsNotifications';
import SettingsPrivacy from './SettingsPrivacy';
import SettingsLanguage from './SettingsLanguage';

import SettingsPrivacyVisibility from './SettingsPrivacyVisibility';
import SettingsPrivacyActiveSessions from './SettingsPrivacyActiveSessions';
import SettingsPrivacyBlockedUsers from './SettingsPrivacyBlockedUsers';

import './Settings.scss';

const TRANSITION_RENDER_COUNT = Object.keys(SettingsScreens).length / 2;
const TRANSITION_DURATION = 200;

export type OwnProps = {
  currentScreen: SettingsScreens;
  onScreenSelect: (screen: SettingsScreens) => void;
  onReset: () => void;
};

const Settings: FC<OwnProps> = ({
  currentScreen,
  onScreenSelect,
  onReset,
}) => {
  const [foldersState, foldersDispatch] = useFoldersReducer();

  const handleReset = useCallback(() => {
    if (
      currentScreen === SettingsScreens.FoldersCreateFolder
      || currentScreen === SettingsScreens.FoldersEditFolder
    ) {
      setTimeout(() => {
        foldersDispatch({ type: 'reset' });
      }, TRANSITION_DURATION);
    }

    if (
      currentScreen === SettingsScreens.FoldersIncludedChats
      || currentScreen === SettingsScreens.FoldersExcludedChats
    ) {
      if (foldersState.mode === 'create') {
        onScreenSelect(SettingsScreens.FoldersCreateFolder);
      } else {
        onScreenSelect(SettingsScreens.FoldersEditFolder);
      }
      return;
    }

    onReset();
  }, [
    foldersState.mode, foldersDispatch,
    currentScreen, onReset, onScreenSelect,
  ]);

  const handleSaveFilter = useCallback(() => {
    foldersDispatch({ type: 'saveFilters' });
    handleReset();
  }, [foldersDispatch, handleReset]);

  function renderCurrentSectionContent() {
    switch (currentScreen) {
      case SettingsScreens.Main:
        return (
          <SettingsMain onScreenSelect={onScreenSelect} />
        );
      case SettingsScreens.EditProfile:
        return (
          <SettingsEditProfile />
        );
      case SettingsScreens.General:
        return (
          <SettingsGeneral onScreenSelect={onScreenSelect} />
        );
      case SettingsScreens.Notifications:
        return (
          <SettingsNotifications />
        );
      case SettingsScreens.Privacy:
        return (
          <SettingsPrivacy onScreenSelect={onScreenSelect} />
        );
      case SettingsScreens.Language:
        return (
          <SettingsLanguage />
        );

      case SettingsScreens.GeneralChatBackground:
        return (
          <SettingsGeneralChatBackground onScreenSelect={onScreenSelect} />
        );

      case SettingsScreens.PrivacyActiveSessions:
        return (
          <SettingsPrivacyActiveSessions />
        );
      case SettingsScreens.PrivacyBlockedUsers:
        return (
          <SettingsPrivacyBlockedUsers />
        );
      case SettingsScreens.PrivacyPhoneNumber:
      case SettingsScreens.PrivacyLastSeen:
      case SettingsScreens.PrivacyProfilePhoto:
      case SettingsScreens.PrivacyForwarding:
      case SettingsScreens.PrivacyGroupChats:
        return (
          <SettingsPrivacyVisibility screen={currentScreen} />
        );

      case SettingsScreens.Folders:
      case SettingsScreens.FoldersCreateFolder:
      case SettingsScreens.FoldersEditFolder:
      case SettingsScreens.FoldersIncludedChats:
      case SettingsScreens.FoldersExcludedChats:
        return (
          <SettingsFolders
            currentScreen={currentScreen}
            state={foldersState}
            dispatch={foldersDispatch}
            onScreenSelect={onScreenSelect}
            onReset={handleReset}
          />
        );

      default:
        return undefined;
    }
  }

  function renderCurrentSection() {
    return (
      <>
        <SettingsHeader
          currentScreen={currentScreen}
          onReset={handleReset}
          onSaveFilter={handleSaveFilter}
          editedFolderId={foldersState.folderId}
        />
        {renderCurrentSectionContent()}
      </>
    );
  }

  return (
    <Transition
      id="Settings"
      name="slide-layers"
      activeKey={currentScreen}
      renderCount={TRANSITION_RENDER_COUNT}
    >
      {renderCurrentSection}
    </Transition>
  );
};

export default memo(Settings);
