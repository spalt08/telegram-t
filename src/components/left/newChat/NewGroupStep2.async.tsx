import React, { FC } from '../../../lib/teact/teact';
import { Bundles } from '../../../util/moduleLoader';

import { OwnProps } from './NewGroupStep2';

import useModuleLoader from '../../../hooks/useModuleLoader';
import Loading from '../../ui/Loading';

const NewGroupStep2Async: FC<OwnProps> = (props) => {
  const NewGroupStep2 = useModuleLoader(Bundles.Extra, 'NewGroupStep2');

  // eslint-disable-next-line react/jsx-props-no-spreading
  return NewGroupStep2 ? <NewGroupStep2 {...props} /> : <Loading />;
};

export default NewGroupStep2Async;
