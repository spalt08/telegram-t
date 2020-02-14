import React, {
  FC, useEffect, memo, useCallback, useMemo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiMessage, ApiVideo } from '../../api/types';

import { selectChatMessage, selectChatMessages } from '../../modules/selectors';
import {
  getChatMediaMessageIds,
  getMessagePhoto,
  getMessageVideo,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getVideoDimensions,
  IDimensions,
  getMessageWebPagePhoto,
} from '../../modules/helpers';
import { buildMessageContent } from '../middle/message/util/buildMessageContent';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import usePrevious from '../../hooks/usePrevious';
import useMedia from '../../hooks/useMedia';

import Spinner from '../ui/Spinner';
import AnimationFade from '../ui/AnimationFade';
import SenderInfo from './SenderInfo';
import MediaViewerActions from './MediaViewerActions';
import MediaViewerFooter from './MediaViewerFooter';
import VideoPlayer from './VideoPlayer';

import './MediaViewer.scss';

type IProps = Pick<GlobalActions, 'openMediaViewer'> & {
  chatId?: number;
  messageId?: number;
  isReversed?: boolean;
  message?: ApiMessage;
  chatMessages?: Record<number, ApiMessage>;
};

const MediaViewer: FC<IProps> = ({
  chatId,
  messageId,
  isReversed,
  message,
  chatMessages,
  openMediaViewer,
}) => {
  const isWebPagePhoto = Boolean(message && getMessageWebPagePhoto(message));
  const messageIds = useMemo(() => {
    return isWebPagePhoto && messageId
      ? [messageId]
      : getChatMediaMessageIds(chatMessages || {}, isReversed);
  }, [isWebPagePhoto, messageId, chatMessages, isReversed]);
  const selectedMediaMessageIndex = messageId ? messageIds.indexOf(messageId) : -1;
  const isFirst = selectedMediaMessageIndex === 0 || selectedMediaMessageIndex === -1;
  const isLast = selectedMediaMessageIndex === messageIds.length - 1 || selectedMediaMessageIndex === -1;
  const isOpen = Boolean(messageId);

  let { text: messageText } = message ? buildMessageContent(message) : { text: undefined };
  let isPhoto = message ? Boolean(getMessagePhoto(message)) || isWebPagePhoto : null;
  let isVideo = message ? Boolean(getMessageVideo(message)) : null;

  const thumbDataUri = message && getMessageMediaThumbDataUri(message);
  let blobUrlPreview = useMedia(message && getMessageMediaHash(message, 'viewerPreview'));
  let blobUrlFull = useMedia(message && getMessageMediaHash(message, 'viewerFull'));

  // For correct unmount animation
  const previousProps = usePrevious({
    message,
    chatId,
    messageId,
    messageText,
    isPhoto,
    isVideo,
    blobUrlFull,
    blobUrlPreview,
  });

  if (!isOpen && previousProps) {
    message = previousProps.message;
    chatId = previousProps.chatId;
    messageId = previousProps.messageId;
    messageText = previousProps.messageText;
    isPhoto = previousProps.isPhoto;
    isVideo = previousProps.isVideo;
    blobUrlFull = previousProps.blobUrlFull;
    blobUrlPreview = previousProps.blobUrlPreview;
  }

  const getMessageId = (fromId: number, direction: number): number => {
    let index = messageIds.indexOf(fromId);
    if ((direction === -1 && index > 0) || (direction === 1 && index < messageIds.length - 1)) {
      index += direction;
    }

    return messageIds[index];
  };

  const closeMediaViewer = useCallback(() => {
    openMediaViewer({ chatId: undefined, messageId: undefined });
  }, [openMediaViewer]);

  useEffect(() => (isOpen ? captureEscKeyListener(closeMediaViewer) : undefined), [closeMediaViewer, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Left': // IE/Edge specific value
        case 'ArrowLeft':
          selectPreviousMedia();
          break;

        case 'Right': // IE/Edge specific value
        case 'ArrowRight':
          selectNextMedia();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  });

  function handleClose(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.stopPropagation();
    const { classList } = e.target as HTMLElement;

    if (!classList.contains('navigation') || classList.contains('media-viewer-footer')) {
      closeMediaViewer();
    }
  }

  function stopEvent(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
  }

  function selectPreviousMedia() {
    if (isFirst) {
      return;
    }
    openMediaViewer({
      chatId,
      messageId: messageId ? getMessageId(messageId, -1) : undefined,
      isReversed,
    });
  }

  function selectNextMedia() {
    if (isLast) {
      return;
    }
    openMediaViewer({
      chatId,
      messageId: messageId ? getMessageId(messageId, 1) : undefined,
      isReversed,
    });
  }

  return (
    <AnimationFade show={isOpen}>
      <div id="MediaViewer" onClick={handleClose}>
        <div className="media-viewer-head" onClick={stopEvent}>
          <SenderInfo chatId={chatId} messageId={messageId} />
          <MediaViewerActions onCloseMediaViewer={closeMediaViewer} />
        </div>
        <div className="media-viewer-content">
          {isPhoto && renderPhoto(blobUrlFull || blobUrlPreview)}
          {isVideo && renderVideo(
            blobUrlFull,
            blobUrlPreview || thumbDataUri,
            message && getVideoDimensions(getMessageVideo(message) as ApiVideo),
          )}
          {!isFirst && (
            <button
              type="button"
              className="navigation prev"
              aria-label="Previous"
              onClick={selectPreviousMedia}
            />
          )}
          {!isLast && (
            <button
              type="button"
              className="navigation next"
              aria-label="Next"
              onClick={selectNextMedia}
            />
          )}
        </div>
        {messageText && <MediaViewerFooter text={messageText} />}
      </div>
    </AnimationFade>
  );
};

function renderPhoto(blobUrl?: string) {
  return blobUrl ? <img src={blobUrl} alt="" /> : <Spinner color="white" />;
}

function renderVideo(blobUrl?: string, posterData?: string, posterSize?: IDimensions) {
  if (blobUrl) {
    return <VideoPlayer key={blobUrl} url={blobUrl} />;
  } else {
    if (posterData && posterSize) {
      return (
        <div className="thumbnail">
          <img
            src={posterData}
            alt=""
            width={posterSize.width}
            height={posterSize.height}
          />
          <Spinner color="white" />
        </div>
      );
    }

    return <Spinner color="white" />;
  }
}

export default memo(withGlobal(
  (global) => {
    const { chatId, messageId, isReversed } = global.mediaViewer;
    if (!chatId || !messageId) {
      return {};
    }

    const chatMessages = selectChatMessages(global, chatId);
    const message = selectChatMessage(global, chatId, messageId);

    if (!message) {
      return {};
    }

    return {
      chatId,
      messageId,
      isReversed,
      message,
      chatMessages,
    };
  },
  (setGlobal, actions) => {
    const { openMediaViewer } = actions;
    return { openMediaViewer };
  },
)(MediaViewer));
