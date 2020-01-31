import React, { FC } from '../../lib/teact/teact';

import { ApiUser, ApiMessage } from '../../api/types';

import { getUserFullName, getMessageMediaThumbDataUri, getMessageMediaHash } from '../../modules/helpers';
import { getImagePictogramDimensions } from '../../util/mediaDimensions';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';
import useMedia from '../../hooks/useMedia';

import RippleEffect from '../ui/RippleEffect';

import './ReplyMessage.scss';

type IProps = {
  message?: ApiMessage;
  sender?: ApiUser;
  className?: string;
};

const ReplyMessage: FC<IProps> = ({
  message, sender, className,
}) => {
  if (!message) {
    return (
      <div className={`ReplyMessage deleted-message ${className || ''}`}>
        <div className="reply-text ">
          <p>Deleted message</p>
        </div>
      </div>
    );
  }

  const { text } = buildMessageContent(message, { isReply: true });

  const mediaThumbnail = getMessageMediaThumbDataUri(message);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mediaBlobUrl = useMedia(getMessageMediaHash(message, 'pictogram'));

  return (
    <div className={`ReplyMessage not-implemented ${className || ''}`}>
      {mediaThumbnail && renderPictogram(mediaThumbnail, mediaBlobUrl)}
      <div className="reply-text">
        <div className="sender-name">{getUserFullName(sender)}</div>
        <p>{text}</p>
      </div>
      <RippleEffect />
    </div>
  );
};

function renderPictogram(thumbDataUri: string, blobUrl?: string) {
  const { width, height } = getImagePictogramDimensions();

  return (
    <img src={blobUrl || thumbDataUri} width={width} height={height} alt="" />
  );
}

export default ReplyMessage;
