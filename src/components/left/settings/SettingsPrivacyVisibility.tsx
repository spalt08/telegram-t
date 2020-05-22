import React, {
  FC, useState, useMemo, memo,
} from '../../../lib/teact/teact';

import { SettingsScreens } from '../../../types';

import ListItem from '../../ui/ListItem';
import RadioGroup from '../../ui/RadioGroup';

type OwnProps = {
  screen: SettingsScreens;
};

const PRIVACY_OPTIONS = [
  { value: 'everybody', label: 'Everybody' },
  { value: 'contacts', label: 'My Contacts' },
  { value: 'nobody', label: 'Nobody' },
];

const SettingsPrivacyVisibility: FC<OwnProps> = ({ screen }) => {
  const [visibility, setVisibility] = useState<string>('everybody');

  const headerText = useMemo(() => {
    switch (screen) {
      case SettingsScreens.PrivacyPhoneNumber:
        return 'Who can see your phone number?';
      case SettingsScreens.PrivacyLastSeen:
        return 'Who can see your Last Seen time?';
      case SettingsScreens.PrivacyProfilePhoto:
        return 'Who can see your profile photo?';
      case SettingsScreens.PrivacyForwarding:
        return 'Who can add a link to your account when forwarding my messages?';
      case SettingsScreens.PrivacyGroupChats:
        return 'Who can add you to group chats?';
      default:
        return undefined;
    }
  }, [screen]);

  const descriptionText = useMemo(() => {
    switch (screen) {
      case SettingsScreens.PrivacyLastSeen:
        return (
          <>
            You won&apos;t see Last Seen and online statuses for people with whom you don&apos;t share yours.<br />
            Approximate last seen will be shown instead<br />
            (recently, within a week, within a month).
          </>
        );
      default:
        return undefined;
    }
  }, [screen]);

  return (
    <div className="settings-content custom-scroll">
      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">{headerText}</h4>

        <RadioGroup
          name="who-can-see-last-seen-time"
          options={PRIVACY_OPTIONS}
          onChange={setVisibility}
          selected={visibility}
        />

        {descriptionText && (
          <p className="settings-item-description-larger">{descriptionText}</p>
        )}
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header mb-4">Exceptions</h4>

        <ListItem
          className="not-implemented"
          narrow
          icon="delete-user"
        >
          <div className="multiline-menu-item">
            <span className="title">Never Share With</span>
            <span className="subtitle">Add Users</span>
          </div>
        </ListItem>
        <ListItem
          className="not-implemented"
          narrow
          icon="add-user"
        >
          <div className="multiline-menu-item">
            <span className="title">Always Share With</span>
            <span className="subtitle">Add Users</span>
          </div>
        </ListItem>
      </div>
    </div>
  );
};

export default memo(SettingsPrivacyVisibility);
