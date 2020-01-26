import React, { FC, useState, useCallback } from '../../lib/teact/teact';

import { ApiMessage, ApiMiniThumbnail, ApiPhotoCachedSize } from '../../api/types';
import { getReplyImageDimensions } from '../../util/imageDimensions';
import RippleEffect from '../ui/RippleEffect';
import Button from '../ui/Button';
import { buildMessageContent } from './message/util/buildMessageContent';
import ConfirmDialog from '../ui/ConfirmDialog';

type IProps = {
  message: ApiMessage;
  onUnpinMessage?: () => void;
};

const HeaderPinnedMessage: FC<IProps> = ({ message, onUnpinMessage }) => {
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

  function stopPropagation(e: React.MouseEvent<any, MouseEvent>) {
    e.stopPropagation();
  }

  const { text, replyThumbnail } = buildMessageContent(message, { isReply: true });

  return (
    <div className="HeaderPinnedMessage-wrapper">
      {onUnpinMessage && ([
        <ConfirmDialog
          isOpen={isUnpinDialogOpen}
          onClose={closeUnpinConfirmation}
          text="Would you like to unpin this message?"
          confirmLabel="Unpin"
          confirmHandler={handleUnpinMessage}
        />,
        <Button
          round
          size="smaller"
          color="translucent"
          ariaLabel="Unpin message"
          onClick={openUnpinConfirmation}
        >
          <i className="icon-close" />
        </Button>,
      ])}

      <div className="HeaderPinnedMessage not-implemented" onClick={stopPropagation}>
        {renderMessagePhoto(replyThumbnail)}
        <div className="message-text">
          <div className="title">Pinned message</div>
          <p>{text}</p>
        </div>

        <RippleEffect />
      </div>
    </div>
  );
};

function renderMessagePhoto(thumbnail?: ApiMiniThumbnail | ApiPhotoCachedSize) {
  if (!thumbnail) {
    return null;
  }

  const { width, height } = getReplyImageDimensions();

  if ('dataUri' in thumbnail) {
    return (
      <img src={thumbnail.dataUri} width={width} height={height} alt="" />
    );
  }

  return (
    <img src={`data:image/jpeg;base64, ${thumbnail.data}`} width={width} height={height} alt="" />
  );
}

export default HeaderPinnedMessage;
