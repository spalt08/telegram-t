import React, { FC, memo } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { SettingsScreens } from '../../../types';
import { ApiUser } from '../../../api/types';

import { selectUser } from '../../../modules/selectors';
import { getUserFullName } from '../../../modules/helpers';
import { formatPhoneNumberWithCode } from '../../../util/phoneNumber';

import ListItem from '../../ui/ListItem';
import Avatar from '../../common/Avatar';

type OwnProps = {
  onScreenSelect: (screen: SettingsScreens) => void;
};

type StateProps = {
  isAnimationLevelBadgeShown: boolean;
  currentUser?: ApiUser;
};

const SettingsMain: FC<OwnProps & StateProps> = ({
  onScreenSelect,
  isAnimationLevelBadgeShown,
  currentUser,
}) => {
  return (
    <div className="settings-content custom-scroll">
      <div className="settings-main-menu">
        {currentUser && (
          <div className="settings-current-user">
            <Avatar user={currentUser} size="jumbo" />
            <p className="name">{getUserFullName(currentUser)}</p>
            <p className="phone">{formatPhoneNumberWithCode(currentUser.phoneNumber)}</p>
          </div>
        )}
        <ListItem
          icon="edit"
          onClick={() => onScreenSelect(SettingsScreens.EditProfile)}
        >
          Edit Profile
        </ListItem>
        <ListItem
          icon="folder"
          onClick={() => onScreenSelect(SettingsScreens.Folders)}
        >
          Chat Folders
        </ListItem>
        <ListItem
          icon="settings"
          attention={isAnimationLevelBadgeShown}
          onClick={() => onScreenSelect(SettingsScreens.General)}
        >
          General Settings
        </ListItem>
        <ListItem
          icon="unmute"
          onClick={() => onScreenSelect(SettingsScreens.Notifications)}
        >
          Notifications
        </ListItem>
        <ListItem
          icon="lock"
          onClick={() => onScreenSelect(SettingsScreens.Privacy)}
        >
          Privacy and Security
        </ListItem>
        <ListItem
          icon="language"
          onClick={() => onScreenSelect(SettingsScreens.Language)}
        >
          Language
        </ListItem>
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { currentUserId } = global;
    const { isAnimationLevelSettingViewed } = global.settings;

    return {
      isAnimationLevelBadgeShown: !isAnimationLevelSettingViewed,
      currentUser: currentUserId ? selectUser(global, currentUserId) : undefined,
    };
  },
)(SettingsMain));
