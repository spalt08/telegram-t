import React, { FC } from '../../lib/teact/teact';
import { OwnProps } from './LeftSearch';
import { Bundles } from '../../util/moduleLoader';

import useModuleLoader from '../../hooks/useModuleLoader';
import Loading from '../ui/Loading';

const LeftSearchAsync: FC<OwnProps> = (props) => {
  const LeftSearch = useModuleLoader(Bundles.Extra, 'LeftSearch');

  // eslint-disable-next-line react/jsx-props-no-spreading
  return LeftSearch ? <LeftSearch {...props} /> : <Loading />;
};

export default LeftSearchAsync;
