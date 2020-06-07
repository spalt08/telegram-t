import React, {
  FC, useCallback, useEffect, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { SettingsScreens, ISettings } from '../../../types';

import { pick } from '../../../util/iteratees';

import ListItem from '../../ui/ListItem';
import RangeSlider from '../../ui/RangeSlider';
import Checkbox from '../../ui/Checkbox';
import RadioGroup from '../../ui/RadioGroup';
import AttentionIndicator from '../../ui/AttentionIndicator';

type OwnProps = {
  onScreenSelect: (screen: SettingsScreens) => void;
};

type StateProps = {
  isAnimationLevelBadgeShown: boolean;
} & Pick<ISettings, (
  'messageTextSize' | 'animationLevel' |
  'messageSendKeyCombo'
)>;

type DispatchProps = Pick<GlobalActions, 'setSettingOption' | 'clearAnimationSettingAttention'>;

const KEYBOARD_SEND_OPTIONS = [
  { value: 'enter', label: 'Send by Enter', subLabel: 'New line by Shift + Enter' },
  { value: 'ctrl-enter', label: 'Send by Ctrl + Enter', subLabel: 'New line by Enter' },
];

const ANIMATION_LEVEL_OPTIONS = [
  'Solid and Steady',
  'Nice and Fast',
  'Lots of Stuff',
];

const ANIMATION_LEVEL_ATTENTION_CLEAR_TIMEOUT_MS = 5000;

const SettingsGeneral: FC<OwnProps & StateProps & DispatchProps> = ({
  // onScreenSelect,
  isAnimationLevelBadgeShown,
  messageTextSize,
  animationLevel,
  messageSendKeyCombo,
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

  const handleMessageTextSizeChange = useCallback((newSize: number) => {
    setSettingOption({ messageTextSize: newSize });
  }, [setSettingOption]);

  const handleMessageSendKeyComboChange = useCallback((newValue: string) => {
    setSettingOption({ messageSendKeyCombo: newValue });
  }, [setSettingOption]);

  return (
    <div className="settings-content custom-scroll">
      <div className="settings-item pt-3 not-implemented">
        <h4 className="settings-item-header">Settings</h4>

        <RangeSlider
          label="Message Text Size"
          range={{ min: 12, max: 20 }}
          value={messageTextSize}
          onChange={handleMessageTextSizeChange}
        />

        <ListItem
          icon="photo"
          className="not-implemented"
        >
         Chat Background
        </ListItem>
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

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Keyboard</h4>

        <RadioGroup
          name="keyboard-send-settings"
          options={KEYBOARD_SEND_OPTIONS}
          onChange={handleMessageSendKeyComboChange}
          selected={messageSendKeyCombo}
        />
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Auto-Download Media</h4>

        <Checkbox
          label="Contacts"
          checked
        />
        <Checkbox
          label="Private Chats"
          checked
        />
        <Checkbox
          label="Group Chats"
          checked
        />
        <Checkbox
          label="Channels"
          checked
        />
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Auto-Play Media</h4>

        <Checkbox
          label="GIFs"
          checked
        />
        <Checkbox
          label="Videos"
          checked
        />
      </div>

      <div className="settings-item not-implemented">
        <h4 className="settings-item-header">Stickers</h4>

        <Checkbox
          label="Suggest Stickers by Emoji"
          checked
        />
        <Checkbox
          label="Loop Animated Stickers"
          checked
        />
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { isAnimationLevelSettingViewed, byKey } = global.settings;

    return {
      isAnimationLevelBadgeShown: !isAnimationLevelSettingViewed,
      ...pick(byKey, [
        'messageTextSize',
        'animationLevel',
        'messageSendKeyCombo',
      ]),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setSettingOption', 'clearAnimationSettingAttention']),
)(SettingsGeneral));
