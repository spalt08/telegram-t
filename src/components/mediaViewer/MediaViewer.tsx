import React, {
  FC, useEffect, memo, useCallback, useMemo, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiMessage } from '../../api/types';

import { calculateMediaViewerVideoDimensions, MEDIA_VIEWER_MEDIA_QUERY } from '../../util/mediaDimensions';
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
import useMedia from '../../hooks/useMedia';

import Spinner from '../ui/Spinner';
import AnimationFade from '../ui/AnimationFade';
import Transition from '../ui/Transition';
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
  const [, onMediaQueryChanged] = useState(null);
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

  const isPhoto = message ? Boolean(getMessagePhoto(message)) || isWebPagePhoto : null;
  const isVideo = message ? Boolean(getMessageVideo(message)) : null;

  const thumbDataUri = message && getMessageMediaThumbDataUri(message);
  const blobUrlPreview = useMedia(message && getMessageMediaHash(message, 'viewerPreview'));
  const blobUrlFull = useMedia(message && getMessageMediaHash(message, 'viewerFull'));

  useEffect(() => {
    const mql = window.matchMedia(MEDIA_VIEWER_MEDIA_QUERY);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onMediaQueryChanged);
    } else if (typeof mql.addListener === 'function') {
      mql.addListener(onMediaQueryChanged);
    }

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onMediaQueryChanged);
      } else if (typeof mql.removeListener === 'function') {
        mql.removeListener(onMediaQueryChanged);
      }
    };
  }, []);

  const videoDimensions = message && isVideo ? getVideoDimensions(getMessageVideo(message)!)! : undefined;

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

  function renderSlide() {
    if (!message) {
      return null;
    }

    const messageText = buildMessageContent(message).text;
    const hasFooter = Boolean(messageText);

    return (
      <div key={messageId} className={`media-viewer-content ${hasFooter ? 'footer' : ''}`}>
        {isPhoto && renderPhoto(blobUrlFull || blobUrlPreview)}
        {isVideo && renderVideo(
          blobUrlFull,
          blobUrlPreview || thumbDataUri,
          message && calculateMediaViewerVideoDimensions(videoDimensions!, hasFooter),
        )}
        {messageText && <MediaViewerFooter text={messageText} />}
      </div>
    );
  }

  function renderSenderInfo() {
    return (
      <div key={messageId}>
        <SenderInfo chatId={chatId} messageId={messageId} />
      </div>
    );
  }

  return (
    <AnimationFade className="MediaViewer" isOpen={isOpen} onClick={handleClose}>
      {() => (
        <>
          <div className="media-viewer-head" onClick={stopEvent}>
            <Transition activeKey={messageId} name="slide-fade">
              {renderSenderInfo}
            </Transition>
            <MediaViewerActions onCloseMediaViewer={closeMediaViewer} />
          </div>
          <Transition activeKey={selectedMediaMessageIndex} name="slow-slide">
            {renderSlide}
          </Transition>
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
        </>
      )}
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
