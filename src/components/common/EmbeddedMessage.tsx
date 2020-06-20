import React, { FC, useEffect } from '../../lib/teact/teact';

import { ApiUser, ApiMessage, ApiChat } from '../../api/types';

import {
  getUserFullName,
  getMessageMediaThumbDataUri,
  getMessageMediaHash,
  isActionMessage,
  getMessageSummaryText,
  isChatPrivate,
  getChatTitle,
} from '../../modules/helpers';
import renderText from './helpers/renderText';
import { getPictogramDimensions } from './helpers/mediaDimensions';
import useMedia from '../../hooks/useMedia';
import buildClassName from '../../util/buildClassName';
import webpHero from '../../util/webpHero';

import RippleEffect from '../ui/RippleEffect';
import ActionMessage from '../middle/ActionMessage';

import './EmbeddedMessage.scss';

type OwnProps = {
  className?: string;
  message?: ApiMessage;
  sender?: ApiUser | ApiChat;
  title?: string;
  loadPictogram?: boolean;
  onClick: NoneToVoidFunction;
};

const NBSP = '\u00A0';

const EmbeddedMessage: FC<OwnProps> = ({
  className, message, sender, title, loadPictogram, onClick,
}) => {
  const mediaThumbnail = message && getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(message && getMessageMediaHash(message, 'pictogram'), !loadPictogram);
  const fullClassName = buildClassName('EmbeddedMessage', className, !message && 'not-implemented');
  const pictogramId = message && `sticker-reply-thumb${message.id}`;
  const { sticker } = (message && message.content) || {};

  const senderTitle = sender && (
    isChatPrivate(sender.id)
      ? getUserFullName(sender as ApiUser)
      : getChatTitle(sender as ApiChat)
  );

  useEffect(() => {
    if (mediaBlobUrl && sticker) {
      webpHero({
        selectors: `#${pictogramId}`,
      });
    }
  }, [mediaBlobUrl, sticker, pictogramId]);

  return (
    <div className={fullClassName} onClick={message ? onClick : undefined}>
      {mediaThumbnail && renderPictogram(pictogramId, mediaThumbnail, mediaBlobUrl)}
      <div className="message-text">
        <div className="message-title">{renderText(senderTitle || title || NBSP)}</div>
        <p>
          {!message ? (
            NBSP
          ) : isActionMessage(message) ? (
            <ActionMessage message={message} isEmbedded />
          ) : (
            renderText(getMessageSummaryText(message, true))
          )}
        </p>
      </div>
      <RippleEffect />
    </div>
  );
};

function renderPictogram(
  id: string | undefined,
  thumbDataUri: string,
  blobUrl?: string,
) {
  const { width, height } = getPictogramDimensions();

  return (
    <img id={id} src={blobUrl || thumbDataUri} width={width} height={height} alt="" />
  );
}

export default EmbeddedMessage;
