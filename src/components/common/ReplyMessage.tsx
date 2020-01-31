import React, { FC } from '../../lib/teact/teact';

import { ApiUser, ApiMessage } from '../../api/types';

import { getUserFullName, getMessageMediaThumbDataUri, getMessageMediaHash } from '../../modules/helpers';
import { getPictogramDimensions } from '../../util/mediaDimensions';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';
import useMedia from '../../hooks/useMedia';

import RippleEffect from '../ui/RippleEffect';

import './ReplyMessage.scss';

type IProps = {
  message: ApiMessage;
  sender?: ApiUser;
  className?: string;
  loadPictogram?: boolean;
};

const ReplyMessage: FC<IProps> = ({
  message, sender, className, loadPictogram,
}) => {
  const { text } = buildMessageContent(message, { isReply: true });

  const mediaThumbnail = getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(getMessageMediaHash(message, 'pictogram'), !loadPictogram);

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
  const { width, height } = getPictogramDimensions();

  return (
    <img src={blobUrl || thumbDataUri} width={width} height={height} alt="" />
  );
}

export default ReplyMessage;
