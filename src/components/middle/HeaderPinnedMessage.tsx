import React, { FC, useState, useCallback } from '../../lib/teact/teact';

import { ApiMessage } from '../../api/types';

import { getPictogramDimensions } from '../common/helpers/mediaDimensions';
import { getMessageMediaHash, getMessageMediaThumbDataUri, getMessageSummaryText } from '../../modules/helpers';
import useMedia from '../../hooks/useMedia';

import ConfirmDialog from '../ui/ConfirmDialog';
import Button from '../ui/Button';
import RippleEffect from '../ui/RippleEffect';

type OwnProps = {
  message: ApiMessage;
  onUnpinMessage?: () => void;
  onClick?: () => void;
};

const HeaderPinnedMessage: FC<OwnProps> = ({
  message, onUnpinMessage, onClick,
}) => {
  const text = getMessageSummaryText(message, true);
  const mediaThumbnail = getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(getMessageMediaHash(message, 'pictogram'));

  const [isUnpinDialogOpen, setIsUnpinDialogOpen] = useState(false);

  function openUnpinConfirmation() {
    setIsUnpinDialogOpen(true);
  }

  function closeUnpinConfirmation() {
    setIsUnpinDialogOpen(false);
  }

  const handleUnpinMessage = useCallback(() => {
    closeUnpinConfirmation();

    if (onUnpinMessage) {
      onUnpinMessage();
    }
  }, [onUnpinMessage]);

  return (
    <div className="HeaderPinnedMessage-wrapper">
      {onUnpinMessage && (
        <>
          <ConfirmDialog
            isOpen={isUnpinDialogOpen}
            onClose={closeUnpinConfirmation}
            text="Would you like to unpin this message?"
            confirmLabel="Unpin"
            confirmHandler={handleUnpinMessage}
          />
          <Button
            round
            ripple
            size="smaller"
            color="translucent"
            ariaLabel="Unpin message"
            onClick={openUnpinConfirmation}
          >
            <i className="icon-close" />
          </Button>
        </>
      )}

      <div className="HeaderPinnedMessage" onClick={onClick}>
        {mediaThumbnail && renderPictogram(mediaThumbnail, mediaBlobUrl)}
        <div className="message-text">
          <div className="title">Pinned message</div>
          <p>{text}</p>
        </div>

        <RippleEffect />
      </div>
    </div>
  );
};

function renderPictogram(thumbDataUri: string, blobUrl?: string) {
  const { width, height } = getPictogramDimensions();

  return (
    <img src={blobUrl || thumbDataUri} width={width} height={height} alt="" />
  );
}

export default HeaderPinnedMessage;
