import React, { FC } from '../../../lib/teact/teact';
import { OwnProps } from './AttachmentModal';
import { Bundles } from '../../../util/moduleLoader';

import useModuleLoader from '../../../hooks/useModuleLoader';

const AttachmentModalAsync: FC<OwnProps> = (props) => {
  const { attachment } = props;
  const AttachmentModal = useModuleLoader(Bundles.Extra, 'AttachmentModal', !attachment);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return AttachmentModal ? <AttachmentModal {...props} /> : undefined;
};

export default AttachmentModalAsync;
