import React, {
  FC, memo, useState, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { SettingsScreens } from '../../../types';

import { pick } from '../../../util/iteratees';

import Transition from '../../ui/Transition';
import Button from '../../ui/Button';
import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';
import ConfirmDialog from '../../ui/ConfirmDialog';

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
  onReset: () => void;
};

type DispatchProps = Pick<GlobalActions, 'signOut'>;

const Settings: FC<OwnProps & DispatchProps> = ({
  currentScreen,
  onScreenSelect,
  onReset,
  signOut,
}) => {
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState<boolean>(false);

  const SettingsMenuButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : ''}
        onMouseDown={onTrigger}
      >
        <i className="icon-more" />
      </Button>
    );
  }, []);

  const openSignOutConfirmation = useCallback(() => {
    setIsSignOutDialogOpen(true);
  }, []);

  const closeSignOutConfirmation = useCallback(() => {
    setIsSignOutDialogOpen(false);
  }, []);

  const handleSignOutMessage = useCallback(() => {
    closeSignOutConfirmation();
    signOut();
  }, [closeSignOutConfirmation, signOut]);

  function renderHeaderContent() {
    switch (currentScreen) {
      case SettingsScreens.EditProfile:
        return <h3>Edit Profile</h3>;
      case SettingsScreens.General:
        return <h3>General</h3>;
      case SettingsScreens.Notifications:
        return <h3>Notifications</h3>;
      case SettingsScreens.Privacy:
        return <h3>Privacy and Security</h3>;
      case SettingsScreens.Language:
        return <h3>Language</h3>;

      case SettingsScreens.PrivacyPhoneNumber:
        return <h3>Phone Number</h3>;
      case SettingsScreens.PrivacyLastSeen:
        return <h3>Last Seen &amp; Online</h3>;
      case SettingsScreens.PrivacyProfilePhoto:
        return <h3>Profile Photo</h3>;
      case SettingsScreens.PrivacyForwarding:
        return <h3>Forwarding Messages</h3>;
      case SettingsScreens.PrivacyGroupChats:
        return <h3>Group Chats</h3>;

      case SettingsScreens.PrivacyActiveSessions:
        return <h3>Active Sessions</h3>;
      case SettingsScreens.PrivacyBlockedUsers:
        return <h3>Blocked Users</h3>;

      default:
        return (
          <div className="settings-main-header">
            <h3>Settings</h3>

            <DropdownMenu
              className="settings-more-menu"
              trigger={SettingsMenuButton}
              positionX="right"
            >
              <MenuItem icon="logout" onClick={openSignOutConfirmation}>Log Out</MenuItem>
            </DropdownMenu>
          </div>
        );
    }
  }

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

  function renderCurrentSection() {
    return (
      <>
        <div className="LeftHeader">
          <Button
            round
            size="smaller"
            color="translucent"
            onClick={onReset}
          >
            <i className="icon-back" />
          </Button>
          {renderHeaderContent()}
          <ConfirmDialog
            isOpen={isSignOutDialogOpen}
            onClose={closeSignOutConfirmation}
            text="Are you sure you want to log out?"
            confirmLabel="Log Out"
            confirmHandler={handleSignOutMessage}
            confirmIsDestructive
          />
        </div>
        {renderCurrentSectionContent()}
      </>
    );
  }

  return (
    <Transition name="slide-layers" activeKey={currentScreen} renderCount={TRANSITION_RENDER_COUNT} id="Settings">
      {renderCurrentSection}
    </Transition>
  );
};

export default memo(withGlobal<OwnProps>(
  undefined,
  (setGlobal, actions): DispatchProps => pick(actions, ['signOut']),
)(Settings));
