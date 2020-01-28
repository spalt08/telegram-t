import React, { FC } from '../../lib/teact/teact';

import {
  ApiUser,
  ApiMessage,
  ApiMiniThumbnail,
  ApiPhotoCachedSize,
} from '../../api/types';

import { getUserFullName } from '../../modules/helpers';
import { getImagePictogramDimensions } from '../../util/mediaDimensions';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';

import RippleEffect from '../ui/RippleEffect';

import './ReplyMessage.scss';

type IProps = {
  message: ApiMessage;
  sender?: ApiUser;
  className?: string;
};

const ReplyMessage: FC<IProps> = ({
  message, sender, className,
}) => {
  const {
    text,
    replyThumbnail,
  } = buildMessageContent(message, { isReply: true });

  return (
    <div className={`ReplyMessage not-implemented ${className || ''}`}>
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

  const { width, height } = getImagePictogramDimensions();

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
