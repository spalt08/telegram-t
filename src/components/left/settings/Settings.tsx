import React, { FC, memo } from '../../../lib/teact/teact';

import { SettingsScreens } from '../../../types';

import Transition from '../../ui/Transition';
import SettingsMain from './SettingsMain';
import SettingsEditProfile from './SettingsEditProfile';
import SettingsGeneral from './SettingsGeneral';
import SettingsNotifications from './SettingsNotifications';
import SettingsPrivacy from './SettingsPrivacy';
import SettingsLanguage from './SettingsLanguage';

import SettingsPrivacyVisibility from './SettingsPrivacyVisibility';
import SettingsPrivacyActiveSessions from './SettingsPrivacyActiveSessions';
import SettingsPrivacyBlockedUsers from './SettingsPrivacyBlockedUsers';

import './Settings.scss';

const TRANSITION_RENDER_COUNT = Object.keys(SettingsScreens).length / 2;

export type OwnProps = {
  currentScreen: SettingsScreens;
  onScreenSelect: (screen: SettingsScreens) => void;
};

const Settings: FC<OwnProps> = ({
  currentScreen,
  onScreenSelect,
}) => {
  function renderCurrentSection() {
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
      default:
        return undefined;
    }
  }

  return (
    <Transition name="slide-layers" activeKey={currentScreen} renderCount={TRANSITION_RENDER_COUNT} id="Settings">
      {renderCurrentSection}
    </Transition>
  );
};

export default memo(Settings);
