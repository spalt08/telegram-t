import React, { FC } from '../../lib/teact/teact';
import { OwnProps } from './LeftRecent';
import { Bundles } from '../../util/moduleLoader';

import useModuleLoader from '../../hooks/useModuleLoader';
import Loading from '../ui/Loading';

const LeftRecentAsync: FC<OwnProps> = (props) => {
  const LeftRecent = useModuleLoader(Bundles.Extra, 'LeftRecent');

  // eslint-disable-next-line react/jsx-props-no-spreading
  return LeftRecent ? <LeftRecent {...props} /> : <Loading />;
};

export default LeftRecentAsync;
