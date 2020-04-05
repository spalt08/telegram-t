import React, { FC, useState } from '../../../lib/teact/teact';

import Transition from '../../ui/Transition';
import SettingsMain from './SettingsMain';

import './Settings.scss';

export enum Content {
  Main,
}

const TRANSITION_RENDER_COUNT = Object.keys(Content).length / 2;

const Settings: FC = () => {
  const [content] = useState(Content.Main);

  function renderCurrentSection() {
    switch (content) {
      case Content.Main:
        return <SettingsMain />;
    }

    return undefined;
  }

  return (
    <Transition name="slide" activeKey={content} renderCount={TRANSITION_RENDER_COUNT} id="Settings">
      {renderCurrentSection}
    </Transition>
  );
};

export default Settings;
