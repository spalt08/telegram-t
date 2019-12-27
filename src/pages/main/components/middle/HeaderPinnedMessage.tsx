import React, { FC } from '../../../../lib/teact';

import { ApiMessage, ApiMiniThumbnail, ApiPhotoCachedSize } from '../../../../api/types';
import { getReplyImageDimensions } from '../../../../util/imageDimensions';
import RippleEffect from '../../../../components/ui/RippleEffect';
import { buildMessageContent } from './message/utils';

type IProps = {
  message: ApiMessage;
};

const HeaderPinnedMessage: FC<IProps> = ({ message }) => {
  function stopPropagation(e: React.MouseEvent<any, MouseEvent>) {
    e.stopPropagation();
  }

  const { text, replyThumbnail } = buildMessageContent(message, { isReply: true });

  return (
    <div className="HeaderPinnedMessage not-implemented" onClick={stopPropagation}>
      {renderMessagePhoto(replyThumbnail)}
      <div className="message-text">
        <div className="title">Pinned message</div>
        <p>{text}</p>
      </div>
      <RippleEffect />
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
