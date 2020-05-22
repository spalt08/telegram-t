import React, { FC, useCallback, memo } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ISettings } from '../../../types';

import { pick } from '../../../util/iteratees';

import RadioGroup from '../../ui/RadioGroup';

type StateProps = Pick<ISettings, 'language'>;

type DispatchProps = Pick<GlobalActions, 'setSettingOption'>;

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', subLabel: 'English' },
  { value: 'fr', label: 'Français', subLabel: 'French' },
  { value: 'de', label: 'Deutsch', subLabel: 'German' },
  { value: 'it', label: 'Italiano', subLabel: 'Italian' },
  { value: 'pt', label: 'Português', subLabel: 'Portuguese' },
  { value: 'ru', label: 'Русский', subLabel: 'Russian' },
  { value: 'es', label: 'Español', subLabel: 'Spanish' },
  { value: 'uk', label: 'Українська', subLabel: 'Ukrainian' },
];

const SettingsLanguage: FC<StateProps & DispatchProps> = ({
  language,
  setSettingOption,
}) => {
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setSettingOption({ language: newLanguage });
  }, [setSettingOption]);

  return (
    <div className="settings-content settings-item settings-language custom-scroll not-implemented">
      <RadioGroup
        name="keyboard-send-settings"
        options={LANGUAGE_OPTIONS}
        onChange={handleLanguageChange}
        selected={language}
      />
    </div>
  );
};

export default memo(withGlobal(
  (global) => pick(global.settings.byKey, ['language']),
  (setGlobal, actions) => pick(actions, ['setSettingOption']),
)(SettingsLanguage));
