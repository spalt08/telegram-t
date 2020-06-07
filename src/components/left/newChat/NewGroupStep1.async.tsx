import React, { FC } from '../../../lib/teact/teact';
import { Bundles } from '../../../util/moduleLoader';

import { OwnProps } from './NewGroupStep1';

import useModuleLoader from '../../../hooks/useModuleLoader';
import Loading from '../../ui/Loading';

const NewGroupStep1Async: FC<OwnProps> = (props) => {
  const NewGroupStep1 = useModuleLoader(Bundles.Extra, 'NewGroupStep1');

  // eslint-disable-next-line react/jsx-props-no-spreading
  return NewGroupStep1 ? <NewGroupStep1 {...props} /> : <Loading />;
};

export default NewGroupStep1Async;
