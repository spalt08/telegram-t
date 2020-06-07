import React, { FC, memo } from '../../../lib/teact/teact';

import { SettingsScreens } from '../../../types';

import ListItem from '../../ui/ListItem';

type OwnProps = {
  onScreenSelect: (screen: SettingsScreens) => void;
};

const SettingsPrivacy: FC<OwnProps> = ({ onScreenSelect }) => {
  return (
    <div className="settings-content custom-scroll">
      <div className="settings-item pt-3">
        <ListItem
          icon="delete-user"
          narrow
          onClick={() => onScreenSelect(SettingsScreens.PrivacyBlockedUsers)}
        >
          <div className="multiline-menu-item">
            <span className="title">Blocked Users</span>
            <span className="subtitle">6 users</span>
          </div>
        </ListItem>
        <ListItem
          icon="active-sessions"
          narrow
          onClick={() => onScreenSelect(SettingsScreens.PrivacyActiveSessions)}
        >
          <div className="multiline-menu-item">
            <span className="title">Active Sessions</span>
            <span className="subtitle">3 devices</span>
          </div>
        </ListItem>
      </div>

      <div className="settings-item">
        <h4 className="settings-item-header mb-4">Privacy</h4>

        <ListItem
          narrow
          onClick={() => onScreenSelect(SettingsScreens.PrivacyPhoneNumber)}
        >
          <div className="multiline-menu-item">
            <span className="title">Who can see my phone number?</span>
            <span className="subtitle">My Contacts</span>
          </div>
        </ListItem>
        <ListItem
          narrow
          onClick={() => onScreenSelect(SettingsScreens.PrivacyLastSeen)}
        >
          <div className="multiline-menu-item">
            <span className="title">Who can see my my Last Seen time?</span>
            <span className="subtitle">Everybody</span>
          </div>
        </ListItem>
        <ListItem
          narrow
          onClick={() => onScreenSelect(SettingsScreens.PrivacyProfilePhoto)}
        >
          <div className="multiline-menu-item">
            <span className="title">Who can see my profile photo?</span>
            <span className="subtitle">Everybody</span>
          </div>
        </ListItem>
        <ListItem
          narrow
          onClick={() => onScreenSelect(SettingsScreens.PrivacyForwarding)}
        >
          <div className="multiline-menu-item">
            <span className="title">Who can add a link to my account when forwarding my messages?</span>
            <span className="subtitle">Everybody</span>
          </div>
        </ListItem>
        <ListItem
          narrow
          onClick={() => onScreenSelect(SettingsScreens.PrivacyGroupChats)}
        >
          <div className="multiline-menu-item">
            <span className="title">Who can add me to group chats?</span>
            <span className="subtitle">Everybody</span>
          </div>
        </ListItem>
      </div>
    </div>
  );
};

export default memo(SettingsPrivacy);
