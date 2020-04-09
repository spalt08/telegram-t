import React, { FC } from '../../lib/teact/teact';
import { Bundles } from '../../util/moduleLoader';

import useModuleLoader from '../../hooks/useModuleLoader';
import Loading from '../ui/Loading';

const ForwardPickerAsync: FC = () => {
  const ForwardPicker = useModuleLoader(Bundles.Extra, 'ForwardPicker');

  return ForwardPicker ? <ForwardPicker /> : <Loading />;
};

export default ForwardPickerAsync;
