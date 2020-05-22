import React, { FC, memo } from '../../../lib/teact/teact';

import Checkbox from '../../ui/Checkbox';

const SettingsNotifications: FC = () => {
  return (
    <div className="settings-content custom-scroll">
      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Private Chats</h4>

        <Checkbox
          label="Notifications for private chats"
          subLabel="Enabled"
          checked
        />
        <Checkbox
          label="Message preview"
          subLabel="Enabled"
          checked
        />
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Groups</h4>

        <Checkbox
          label="Notifications for groups"
          subLabel="Enabled"
          checked
        />
        <Checkbox
          label="Message preview"
          subLabel="Disabled"
          checked={false}
        />
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Channels</h4>

        <Checkbox
          label="Notifications for channels"
          subLabel="Enabled"
          checked
        />
        <Checkbox
          label="Message preview"
          subLabel="Enabled"
          checked
        />
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Other</h4>

        <Checkbox
          label="Contacts joined Telegram"
          checked
        />
      </div>
    </div>
  );
};

export default memo(SettingsNotifications);
