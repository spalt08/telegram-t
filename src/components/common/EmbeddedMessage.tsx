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
import buildClassName from '../../util/buildClassName';

import RippleEffect from '../ui/RippleEffect';
import ServiceMessage from '../middle/ServiceMessage';

import './EmbeddedMessage.scss';

type IProps = {
  className?: string;
  message?: ApiMessage;
  sender?: ApiUser;
  title?: string;
  loadPictogram?: boolean;
  onClick: NoneToVoidFunction;
};

const NBSP = '\u00A0';

const EmbeddedMessage: FC<IProps> = ({
  className, message, sender, title, loadPictogram, onClick,
}) => {
  const mediaThumbnail = message && getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(message && getMessageMediaHash(message, 'pictogram'), !loadPictogram);
  const fullClassName = buildClassName('EmbeddedMessage', className, !message && 'not-implemented');

  return (
    <div className={fullClassName} onClick={message ? onClick : undefined}>
      {mediaThumbnail && renderPictogram(mediaThumbnail, mediaBlobUrl)}
      <div className="message-text">
        <div className="message-title">{(sender && getUserFullName(sender)) || title || NBSP}</div>
        <p>
          {!message ? (
            NBSP
          ) : isActionMessage(message) ? (
            <ServiceMessage message={message} isEmbedded />
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

export default EmbeddedMessage;
