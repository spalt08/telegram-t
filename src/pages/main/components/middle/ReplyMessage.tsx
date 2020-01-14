import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiMiniThumbnail,
  ApiPhotoCachedSize,
} from '../../../../api/types';
import { getUserFullName } from '../../../../modules/helpers';
import { getReplyImageDimensions } from '../../../../util/imageDimensions';

import { buildMessageContent } from './message/utils';
import './ReplyMessage.scss';
import RippleEffect from '../../../../components/ui/RippleEffect';

type IProps = {
  message: ApiMessage;
  sender?: ApiUser;
};

const ReplyMessage: FC<IProps> = ({
  message, sender,
}) => {
  const {
    text,
    replyThumbnail,
  } = buildMessageContent(message, { isReply: true });

  return (
    <div className="ReplyMessage not-implemented">
      {renderMessagePhoto(replyThumbnail)}
      <div className="reply-text">
        <div className="sender-name">{getUserFullName(sender)}</div>
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

export default ReplyMessage;
