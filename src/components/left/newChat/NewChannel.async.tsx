import React, { FC } from '../../../lib/teact/teact';
import { Bundles } from '../../../util/moduleLoader';

import { OwnProps } from './NewChannel';

import useModuleLoader from '../../../hooks/useModuleLoader';
import Loading from '../../ui/Loading';

const NewChannelAsync: FC<OwnProps> = (props) => {
  const NewChannel = useModuleLoader(Bundles.Extra, 'NewChannel');

  // eslint-disable-next-line react/jsx-props-no-spreading
  return NewChannel ? <NewChannel {...props} /> : <Loading />;
};

export default NewChannelAsync;
