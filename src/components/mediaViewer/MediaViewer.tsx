import React, {
  FC, useEffect, memo, useCallback, useMemo, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiMessage, ApiChat } from '../../api/types';

import { calculateMediaViewerVideoDimensions, MEDIA_VIEWER_MEDIA_QUERY } from '../common/helpers/mediaDimensions';
import {
  selectChatMessage,
  selectChatMessages,
  selectChat,
} from '../../modules/selectors';
import {
  getChatMediaMessageIds,
  getMessagePhoto,
  getMessageVideo,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getVideoDimensions,
  IDimensions,
  getMessageWebPagePhoto,
  getMessageMediaFilename,
  getChatAvatarHash,
} from '../../modules/helpers';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import useMedia from '../../hooks/useMedia';
import { renderMessageText } from '../common/helpers/renderMessageText';
import useMediaWithDownloadProgress from '../../hooks/useMediaWithDownloadProgress';

import Spinner from '../ui/Spinner';
import AnimationFade from '../ui/AnimationFade';
import Transition from '../ui/Transition';
import SenderInfo from './SenderInfo';
import MediaViewerActions from './MediaViewerActions';
import MediaViewerFooter from './MediaViewerFooter';
import VideoPlayer from './VideoPlayer';
import ProgressSpinner from '../ui/ProgressSpinner';

import './MediaViewer.scss';

type StateProps = {
  chatId?: number;
  messageId?: number;
  isReversed?: boolean;
  avatarOwner?: ApiChat;
  message?: ApiMessage;
  chatMessages?: Record<number, ApiMessage>;
};

type DispatchProps = Pick<GlobalActions, 'openMediaViewer' | 'openForwardMenu'>;

const MediaViewer: FC<StateProps & DispatchProps> = ({
  chatId,
  messageId,
  isReversed,
  avatarOwner,
  message,
  chatMessages,
  openMediaViewer,
  openForwardMenu,
}) => {
  const [, onMediaQueryChanged] = useState(null);

  const isWebPagePhoto = Boolean(message && getMessageWebPagePhoto(message));
  const isPhoto = message ? Boolean(getMessagePhoto(message)) || isWebPagePhoto : false;
  const isVideo = message ? Boolean(getMessageVideo(message)) : false;
  const isGif = message && isVideo ? getMessageVideo(message)!.isGif : undefined;
  const fileName = avatarOwner
    ? `avatar${avatarOwner.id}.jpg`
    : message && getMessageMediaFilename(message);

  const messageIds = useMemo(() => {
    return isWebPagePhoto && messageId
      ? [messageId]
      : getChatMediaMessageIds(chatMessages || {}, isReversed);
  }, [isWebPagePhoto, messageId, chatMessages, isReversed]);

  function getMediaHash(full?: boolean) {
    if (avatarOwner) {
      return getChatAvatarHash(avatarOwner, full ? 'big' : 'normal');
    }

    return message && getMessageMediaHash(message, full ? 'viewerFull' : 'viewerPreview');
  }

  const selectedMediaMessageIndex = messageId ? messageIds.indexOf(messageId) : -1;
  const isFirst = selectedMediaMessageIndex === 0 || selectedMediaMessageIndex === -1;
  const isLast = selectedMediaMessageIndex === messageIds.length - 1 || selectedMediaMessageIndex === -1;
  const isOpen = Boolean(avatarOwner || messageId);

  const thumbDataUri = message && getMessageMediaThumbDataUri(message);
  const blobUrlPreview = useMedia(getMediaHash());

  // TODO Fix race condition for progress callbacks of different slides
  const {
    mediaData: blobUrlFull,
    downloadProgress,
  } = useMediaWithDownloadProgress(getMediaHash(true));

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

  const handleForward = useCallback(() => {
    openForwardMenu({ fromChatId: chatId, messageIds: [messageId] });
  }, [openForwardMenu, chatId, messageId]);

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
    if (avatarOwner) {
      return (
        <div key={chatId} className="media-viewer-content">
          {renderPhoto(blobUrlFull || blobUrlPreview)}
        </div>
      );
    } else if (message) {
      const textParts = renderMessageText(message);
      const hasFooter = Boolean(textParts);

      return (
        <div key={messageId} className={`media-viewer-content ${hasFooter ? 'footer' : ''}`}>
          {isPhoto && renderPhoto(blobUrlFull || blobUrlPreview)}
          {isVideo && renderVideo(
            blobUrlFull,
            blobUrlPreview || thumbDataUri,
            downloadProgress,
            message && calculateMediaViewerVideoDimensions(videoDimensions!, hasFooter),
            isGif,
          )}
          {textParts && <MediaViewerFooter text={textParts} />}
        </div>
      );
    }

    return null;
  }

  function renderSenderInfo() {
    return (
      <SenderInfo
        key={avatarOwner ? avatarOwner.id : messageId}
        chatId={avatarOwner ? avatarOwner.id : chatId}
        messageId={messageId}
        isAvatar={Boolean(avatarOwner)}
      />
    );
  }

  return (
    <AnimationFade className="MediaViewer" isOpen={isOpen} onClick={handleClose}>
      {() => (
        <>
          <div className="media-viewer-head" onClick={stopEvent}>
            <Transition activeKey={messageId} direction={isReversed ? 'inverse' : 'auto'} name="slide-fade">
              {renderSenderInfo}
            </Transition>
            <MediaViewerActions
              blobUrl={blobUrlFull || blobUrlPreview}
              fileName={fileName}
              onCloseMediaViewer={closeMediaViewer}
              onForward={handleForward}
              isAvatar={Boolean(avatarOwner)}
            />
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

function renderVideo(
  blobUrl?: string, posterData?: string, downloadProgress?: number, posterSize?: IDimensions, isGif?: boolean,
) {
  if (blobUrl) {
    return <VideoPlayer key={blobUrl} url={blobUrl} isGif={isGif} />;
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
          <ProgressSpinner progress={downloadProgress} />
        </div>
      );
    }

    return <Spinner color="white" />;
  }
}

export default memo(withGlobal(
  (global): StateProps => {
    const {
      chatId, messageId, avatarOwnerId, isReversed,
    } = global.mediaViewer;

    if (avatarOwnerId) {
      return {
        messageId: -1,
        avatarOwner: selectChat(global, avatarOwnerId),
      };
    }

    if (!chatId || !messageId) {
      return {};
    }

    const chatMessages = selectChatMessages(global, chatId);
    const message = selectChatMessage(global, chatId, messageId!);

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
  (setGlobal, actions): DispatchProps => {
    const { openMediaViewer, openForwardMenu } = actions;
    return { openMediaViewer, openForwardMenu };
  },
)(MediaViewer));
