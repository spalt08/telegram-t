import React, {
  FC, memo, useCallback, useEffect, useMemo, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import {
  ApiChat, ApiMediaFormat, ApiMessage, ApiUser,
} from '../../api/types';
import { MediaViewerOrigin } from '../../types';

import {
  AVATAR_FULL_DIMENSIONS,
  calculateMediaViewerDimensions,
  MEDIA_VIEWER_MEDIA_QUERY,
} from '../common/helpers/mediaDimensions';
import {
  selectChat, selectChatMessage, selectChatMessages, selectUser,
} from '../../modules/selectors';
import {
  getChatAvatarHash,
  getChatMediaMessageIds,
  getMessageMediaFilename,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMessagePhoto,
  getMessageVideo,
  getMessageWebPagePhoto,
  getPhotoFullDimensions,
  getVideoDimensions,
  IDimensions,
} from '../../modules/helpers';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import useMedia from '../../hooks/useMedia';
import usePrevious from '../../hooks/usePrevious';
import { renderMessageText } from '../common/helpers/renderMessageText';
import useMediaWithDownloadProgress from '../../hooks/useMediaWithDownloadProgress';
import { animateClosing, animateOpening } from './helpers/ghostAnimation';
import { pick } from '../../util/iteratees';

import Spinner from '../ui/Spinner';
import AnimationFade from '../ui/AnimationFade';
import Transition from '../ui/Transition';
import SenderInfo from './SenderInfo';
import MediaViewerActions from './MediaViewerActions';
import MediaViewerFooter from './MediaViewerFooter';
import VideoPlayer from './VideoPlayer';

import './MediaViewer.scss';

type StateProps = {
  chatId?: number;
  messageId?: number;
  origin?: MediaViewerOrigin;
  avatarOwner?: ApiChat | ApiUser;
  message?: ApiMessage;
  chatMessages?: Record<number, ApiMessage>;
  animationLevel: 0 | 1 | 2;
};

type DispatchProps = Pick<GlobalActions, 'openMediaViewer' | 'openForwardMenu'>;

const MediaViewer: FC<StateProps & DispatchProps> = ({
  chatId,
  messageId,
  origin,
  avatarOwner,
  message,
  chatMessages,
  openMediaViewer,
  openForwardMenu,
  animationLevel,
}) => {
  const [, onMediaQueryChanged] = useState();
  const prevOrigin = usePrevious(origin);
  const isWebPagePhoto = Boolean(message && getMessageWebPagePhoto(message));
  const isPhoto = message ? Boolean(getMessagePhoto(message)) || isWebPagePhoto : false;
  const isVideo = message ? Boolean(getMessageVideo(message)) : false;
  const isGif = message && isVideo ? getMessageVideo(message)!.isGif : undefined;
  const isFromSharedMedia = origin === MediaViewerOrigin.SharedMedia;
  const fileName = avatarOwner
    ? `avatar${avatarOwner.id}.jpg`
    : message && getMessageMediaFilename(message);

  const messageIds = useMemo(() => {
    return isWebPagePhoto && messageId
      ? [messageId]
      : getChatMediaMessageIds(chatMessages || {}, isFromSharedMedia);
  }, [isWebPagePhoto, messageId, chatMessages, isFromSharedMedia]);

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
  const prevMessage = usePrevious<ApiMessage | undefined>(message);
  const prevAvatarOwner = usePrevious<ApiChat | ApiUser | undefined>(avatarOwner);

  const thumbDataUri = message && getMessageMediaThumbDataUri(message);
  const blobUrlPictogram = useMedia(message && isFromSharedMedia && getMessageMediaHash(message, 'pictogram'));
  const blobUrlPreview = useMedia(getMediaHash());
  const { mediaData: fullMediaData, downloadProgress } = useMediaWithDownloadProgress(
    getMediaHash(true),
    undefined,
    isVideo ? ApiMediaFormat.Progressive : ApiMediaFormat.BlobUrl,
  );

  const bestImageData = (!isVideo && fullMediaData) || blobUrlPreview || blobUrlPictogram || thumbDataUri;
  const photoDimensions = isPhoto ? getPhotoFullDimensions((
    isWebPagePhoto ? getMessageWebPagePhoto(message!) : getMessagePhoto(message!)
  )!) : undefined;
  const videoDimensions = isVideo ? getVideoDimensions(getMessageVideo(message!)!) : undefined;

  const slideAnimation = animationLevel >= 1 ? 'mv-slide' : 'none';
  const headerAnimation = animationLevel === 2 ? 'slide-fade' : 'none';
  const isGhostAnimation = animationLevel === 2;

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

  useEffect(() => {
    if (isGhostAnimation && isOpen && !prevMessage && !prevAvatarOwner) {
      const textParts = message ? renderMessageText(message) : undefined;
      const hasFooter = Boolean(textParts);
      animateOpening(message!, hasFooter, origin!, bestImageData!);
    }

    if (isGhostAnimation && !isOpen && (prevMessage || prevAvatarOwner)) {
      animateClosing(prevMessage!, prevOrigin!);
    }
  }, [isGhostAnimation, isOpen, origin, prevOrigin, message, prevMessage, prevAvatarOwner, bestImageData]);

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
    openForwardMenu({ fromChatId: chatId, messageIds: [messageId], noDelay: true });
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
      origin,
    });
  }

  function selectNextMedia() {
    if (isLast) {
      return;
    }
    openMediaViewer({
      chatId,
      messageId: messageId ? getMessageId(messageId, 1) : undefined,
      origin,
    });
  }

  function renderSlide() {
    if (avatarOwner) {
      return (
        <div key={chatId} className="media-viewer-content">
          {renderPhoto(fullMediaData || blobUrlPreview, calculateMediaViewerDimensions(AVATAR_FULL_DIMENSIONS, false))}
        </div>
      );
    } else if (message) {
      const textParts = renderMessageText(message);
      const hasFooter = Boolean(textParts);

      return (
        <div key={messageId} className={`media-viewer-content ${hasFooter ? 'has-footer' : ''}`}>
          {isPhoto && renderPhoto(
            fullMediaData || blobUrlPreview || blobUrlPictogram,
            message && calculateMediaViewerDimensions(photoDimensions!, hasFooter),
          )}
          {isVideo && (
            <VideoPlayer
              key={fullMediaData}
              url={fullMediaData}
              isGif={isGif}
              posterData={blobUrlPreview || thumbDataUri}
              posterSize={message && calculateMediaViewerDimensions(videoDimensions!, hasFooter)}
              downloadProgress={downloadProgress}
              isMediaViewerOpen={isOpen}
              onClose={handleClose}
            />
          )}
          {textParts && <MediaViewerFooter text={textParts} />}
        </div>
      );
    }

    return undefined;
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
    <AnimationFade
      id="MediaViewer"
      isOpen={isOpen}
      onClick={handleClose}
    >
      {() => (
        <>
          <div className="media-viewer-head" onClick={stopEvent}>
            <Transition activeKey={selectedMediaMessageIndex} name={headerAnimation}>
              {renderSenderInfo}
            </Transition>
            <MediaViewerActions
              blobUrl={fullMediaData || blobUrlPreview}
              fileName={fileName}
              onCloseMediaViewer={closeMediaViewer}
              onForward={handleForward}
              isAvatar={Boolean(avatarOwner)}
            />
          </div>
          <Transition activeKey={selectedMediaMessageIndex} name={slideAnimation}>
            {renderSlide}
          </Transition>
          {!isFirst && (
            <button
              type="button"
              className={`navigation prev ${isVideo && !isGif && 'inline'}`}
              aria-label="Previous"
              onClick={selectPreviousMedia}
            />
          )}
          {!isLast && (
            <button
              type="button"
              className={`navigation next ${isVideo && !isGif && 'inline'}`}
              aria-label="Next"
              onClick={selectNextMedia}
            />
          )}
        </>
      )}
    </AnimationFade>
  );
};

function renderPhoto(blobUrl?: string, imageSize?: IDimensions) {
  return blobUrl
    ? (
      <img
        src={blobUrl}
        alt=""
        // @ts-ignore teact feature
        style={imageSize ? `width: ${imageSize!.width}px` : ''}
      />
    )
    : <Spinner color="white" />;
}

export default memo(withGlobal(
  (global): StateProps => {
    const {
      chatId, messageId, avatarOwnerId, origin,
    } = global.mediaViewer;
    const {
      animationLevel,
    } = global.settings.byKey;

    if (avatarOwnerId) {
      return {
        messageId: -1,
        avatarOwner: selectChat(global, avatarOwnerId) || selectUser(global, avatarOwnerId),
        animationLevel,
        origin,
      };
    }

    if (!chatId || !messageId) {
      return { animationLevel };
    }

    const chatMessages = selectChatMessages(global, chatId);
    const message = selectChatMessage(global, chatId, messageId!);

    if (!message) {
      return { animationLevel };
    }

    return {
      chatId,
      messageId,
      origin,
      message,
      chatMessages,
      animationLevel,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openMediaViewer', 'openForwardMenu']),
)(MediaViewer));
