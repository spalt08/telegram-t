import React, { FC } from '../../../lib/teact/teact';
import { Bundles } from '../../../util/moduleLoader';

import { OwnProps } from './NewGroup';

import useModuleLoader from '../../../hooks/useModuleLoader';
import Loading from '../../ui/Loading';

const NewGroupAsync: FC<OwnProps> = (props) => {
  const NewGroup = useModuleLoader(Bundles.Extra, 'NewGroup');

  // eslint-disable-next-line react/jsx-props-no-spreading
  return NewGroup ? <NewGroup {...props} /> : <Loading />;
};

export default NewGroupAsync;
