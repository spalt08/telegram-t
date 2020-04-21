import React, { FC, useCallback, useEffect } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ISettings } from '../../../types';
import { GlobalActions } from '../../../global/types';
import { ApiUser } from '../../../api/types';

import { selectUser } from '../../../modules/selectors';
import { getUserFullName } from '../../../modules/helpers';
import { formatPhoneNumberWithCode } from '../../../util/phoneNumber';
import { pick } from '../../../util/iteratees';

// import MenuItem from '../../ui/MenuItem';
import RangeSlider from '../../ui/RangeSlider';
import AttentionIndicator from '../../ui/AttentionIndicator';
import Avatar from '../../common/Avatar';

type StateProps = {
  isAnimationLevelBadgeShown: boolean;
  currentUser?: ApiUser;
} & Pick<ISettings, 'animationLevel'>;

type DispatchProps = Pick<GlobalActions, 'setSettingOption' | 'clearAnimationSettingAttention'>;

const ANIMATION_LEVEL_OPTIONS = [
  'Solid and Steady',
  'Nice and Fast',
  'Lots of Stuff',
];

const ANIMATION_LEVEL_ATTENTION_CLEAR_TIMEOUT_MS = 5000;

const SettingsMain: FC<StateProps & DispatchProps> = ({
  animationLevel,
  isAnimationLevelBadgeShown,
  currentUser,
  setSettingOption,
  clearAnimationSettingAttention,
}) => {
  const handleAnimationLevelChange = useCallback((newLevel: number) => {
    ANIMATION_LEVEL_OPTIONS.forEach((_, i) => {
      document.body.classList.toggle(`animation-level-${i}`, newLevel === i);
    });

    setSettingOption({ animationLevel: newLevel });
  }, [setSettingOption]);

  useEffect(() => {
    if (isAnimationLevelBadgeShown) {
      setTimeout(() => {
        clearAnimationSettingAttention();
      }, ANIMATION_LEVEL_ATTENTION_CLEAR_TIMEOUT_MS);
    }
  }, [isAnimationLevelBadgeShown, clearAnimationSettingAttention]);

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
        {/* <MenuItem className="not-implemented" disabled icon="edit">Edit Profile</MenuItem>
         <MenuItem className="not-implemented" disabled icon="settings">General Settings</MenuItem>
         <MenuItem className="not-implemented" disabled icon="unmute">Notifications</MenuItem>
         <MenuItem className="not-implemented" disabled icon="lock">Privacy and Security</MenuItem>
         <MenuItem className="not-implemented" disabled icon="language">Language</MenuItem> */}
      </div>

      <div className="settings-item">
        <h4 className="settings-item-header">
          <AttentionIndicator show={isAnimationLevelBadgeShown} />
          Animation Level
        </h4>
        <p className="settings-item-description">Please choose the desired animations amount.</p>

        <RangeSlider
          options={ANIMATION_LEVEL_OPTIONS}
          value={animationLevel}
          onChange={handleAnimationLevelChange}
        />
      </div>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { currentUserId } = global;
    const { byKey: settings, isAnimationLevelSettingViewed } = global.settings;
    const { animationLevel } = settings;

    return {
      animationLevel,
      isAnimationLevelBadgeShown: !isAnimationLevelSettingViewed,
      currentUser: currentUserId ? selectUser(global, currentUserId) : undefined,
    };
  },
  (setGlobal, actions) => pick(actions, ['setSettingOption', 'clearAnimationSettingAttention']),
)(SettingsMain);
