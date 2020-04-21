import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { Bundles } from '../../util/moduleLoader';
import useModuleLoader from '../../hooks/useModuleLoader';

interface StateProps {
  isOpen: boolean;
}

const MediaViewerAsync: FC<StateProps> = ({ isOpen }) => {
  const MediaViewer = useModuleLoader(Bundles.Extra, 'MediaViewer', !isOpen);

  return MediaViewer ? <MediaViewer /> : undefined;
};

export default memo(withGlobal(
  (global): StateProps => {
    const { messageId, avatarOwnerId } = global.mediaViewer;

    return {
      isOpen: Boolean(messageId || avatarOwnerId),
    };
  },
)(MediaViewerAsync));
