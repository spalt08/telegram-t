import React, { FC } from '../../../lib/teact/teact';
import { Bundles } from '../../../util/moduleLoader';

import useModuleLoader from '../../../hooks/useModuleLoader';
import Loading from '../../ui/Loading';

const SettingsAsync: FC = () => {
  const Settings = useModuleLoader(Bundles.Extra, 'Settings');

  return Settings ? <Settings /> : <Loading />;
};

export default SettingsAsync;
