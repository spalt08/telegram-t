import React, { FC, memo } from '../../../lib/teact/teact';

import ListItem from '../../ui/ListItem';

const SettingsPrivacyActiveSessions: FC = () => {
  return (
    <div className="settings-content custom-scroll">
      <div className="settings-item">
        <h4 className="settings-item-header mb-4">Current Session</h4>

        <ListItem narrow inactive className="not-implemented">
          <div className="multiline-menu-item">
            <span className="title">Telegram Web 1.0</span>
            <span className="subtitle black">Safari, macOS</span>
            <span className="subtitle">216.3.128.12 - Paris, France</span>
          </div>
        </ListItem>

        <ListItem
          className="destructive mb-0 not-implemented"
          icon="stop"
          ripple
          narrow
        >
          Terminate all other sessions
        </ListItem>
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header mb-4">Other Sessions</h4>

        <ListItem
          className="not-implemented"
          ripple
          narrow
          contextAction={{
            title: 'Terminate',
            icon: 'stop',
            handler: () => { },
          }}
        >
          <div className="multiline-menu-item">
            <span className="title">Telegram iOS 5.12</span>
            <span className="subtitle black">iPhone X, iOS 13.2</span>
            <span className="subtitle">216.3.128.12 - Paris, France</span>
          </div>
        </ListItem>
        <ListItem
          className="not-implemented"
          ripple
          narrow
          contextAction={{
            title: 'Terminate',
            icon: 'stop',
            handler: () => { },
          }}
        >
          <div className="multiline-menu-item">
            <span className="title">Telegram Android 5.11</span>
            <span className="subtitle black">Samsung Galaxy S9, Android 9P</span>
            <span className="subtitle">216.3.128.12 - Paris, France</span>
          </div>
        </ListItem>
      </div>
    </div>
  );
};

export default memo(SettingsPrivacyActiveSessions);
