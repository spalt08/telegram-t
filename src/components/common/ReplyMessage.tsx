import React, { FC } from '../../lib/teact/teact';

import { ApiUser, ApiMessage } from '../../api/types';

import {
  getUserFullName,
  getMessageMediaThumbDataUri,
  getMessageMediaHash,
  isActionMessage,
  getMessageSummaryText,
} from '../../modules/helpers';
import { getPictogramDimensions } from './helpers/mediaDimensions';
import useMedia from '../../hooks/useMedia';

import RippleEffect from '../ui/RippleEffect';
import ServiceMessage from '../middle/ServiceMessage';

import './ReplyMessage.scss';

type IProps = {
  message?: ApiMessage;
  sender?: ApiUser;
  className?: string;
  loadPictogram?: boolean;
  onClick?: NoneToVoidFunction;
};

const NBSP = '\u00A0';

const ReplyMessage: FC<IProps> = ({
  message, sender, className, loadPictogram, onClick,
}) => {
  const mediaThumbnail = message && getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(message && getMessageMediaHash(message, 'pictogram'), !loadPictogram);

  return (
    <div className={`ReplyMessage ${className || ''}`} onClick={onClick}>
      {mediaThumbnail && renderPictogram(mediaThumbnail, mediaBlobUrl)}
      <div className="reply-text">
        <div className="sender-name">{(sender && getUserFullName(sender)) || NBSP}</div>
        <p>
          {!message ? (
            NBSP
          ) : isActionMessage(message) ? (
            <ServiceMessage message={message} isReply />
          ) : (
            getMessageSummaryText(message, true)
          )}
        </p>
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
