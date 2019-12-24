import React, { FC } from '../../../../lib/teact';

import Button from '../../../../components/ui/Button';
import './MediaViewerActions.scss';

type IProps = {
  onCloseMediaViewer: Function;
};

const MediaViewerActions: FC<IProps> = ({ onCloseMediaViewer }) => {
  return (
    <div className="MediaViewerActions">
      <Button round size="smaller" color="translucent-white" ariaLabel="Delete" className="not-implemented">
        <i className="icon-delete" />
      </Button>
      <Button round size="smaller" color="translucent-white" ariaLabel="Forward" className="not-implemented">
        <i className="icon-forward" />
      </Button>
      <Button round size="smaller" color="translucent-white" ariaLabel="Download" className="not-implemented">
        <i className="icon-download" />
      </Button>
      <Button
        round
        size="smaller"
        color="translucent-white"
        ariaLabel="Close"
        onClick={onCloseMediaViewer}
      >
        <i className="icon-close" />
      </Button>
    </div>
  );
};

export default MediaViewerActions;
