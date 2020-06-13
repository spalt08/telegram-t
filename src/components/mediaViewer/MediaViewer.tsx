import React, {
  FC, memo, useCallback, useEffect, useMemo,
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
import useForceUpdate from '../../hooks/useForceUpdate';
import { dispatchHeavyAnimationEvent } from '../../hooks/useHeavyAnimationCheck';

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

const ANIMATION_DURATION = 350;

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
  const isOpen = Boolean(avatarOwner || messageId);
  const webPagePhoto = message ? getMessageWebPagePhoto(message) : undefined;
  const photo = message ? getMessagePhoto(message) : undefined;
  const video = message ? getMessageVideo(message) : undefined;
  const isWebPagePhoto = Boolean(webPagePhoto);
  const isPhoto = Boolean(photo || webPagePhoto);
  const isVideo = Boolean(video);
  const isGif = video ? video.isGif : undefined;
  const isFromSharedMedia = origin === MediaViewerOrigin.SharedMedia;
  const slideAnimation = animationLevel >= 1 ? 'mv-slide' : 'none';
  const headerAnimation = animationLevel === 2 ? 'slide-fade' : 'none';
  const isGhostAnimation = animationLevel === 2;
  const fileName = avatarOwner ? `avatar${avatarOwner.id}.jpg` : message && getMessageMediaFilename(message);

  const messageIds = useMemo(() => {
    return isWebPagePhoto && messageId
      ? [messageId]
      : getChatMediaMessageIds(chatMessages || {}, isFromSharedMedia);
  }, [isWebPagePhoto, messageId, chatMessages, isFromSharedMedia]);

  const selectedMediaMessageIndex = messageId ? messageIds.indexOf(messageId) : -1;
  const isFirst = selectedMediaMessageIndex === 0 || selectedMediaMessageIndex === -1;
  const isLast = selectedMediaMessageIndex === messageIds.length - 1 || selectedMediaMessageIndex === -1;

  function getMediaHash(full?: boolean) {
    if (avatarOwner) {
      return getChatAvatarHash(avatarOwner, full ? 'big' : 'normal');
    }

    return message && getMessageMediaHash(message, full ? 'viewerFull' : 'viewerPreview');
  }

  const thumbDataUri = message && getMessageMediaThumbDataUri(message);
  const blobUrlPictogram = useMedia(message && isFromSharedMedia && getMessageMediaHash(message, 'pictogram'));
  const blobUrlPreview = useMedia(
    getMediaHash(), undefined, ApiMediaFormat.BlobUrl, isGhostAnimation && ANIMATION_DURATION,
  );
  const { mediaData: fullMediaData, downloadProgress } = useMediaWithDownloadProgress(
    getMediaHash(true),
    undefined,
    isVideo ? ApiMediaFormat.Progressive : ApiMediaFormat.BlobUrl,
    undefined,
    isGhostAnimation && ANIMATION_DURATION,
  );
  const localBlobUrl = (photo || video) ? (photo || video)!.blobUrl : undefined;
  const bestImageData = (
    localBlobUrl || (isPhoto && fullMediaData) || blobUrlPreview || blobUrlPictogram || thumbDataUri
  );
  const photoDimensions = isPhoto ? getPhotoFullDimensions((
    isWebPagePhoto ? getMessageWebPagePhoto(message!) : getMessagePhoto(message!)
  )!) : undefined;
  const videoDimensions = isVideo ? getVideoDimensions(getMessageVideo(message!)!) : undefined;

  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const mql = window.matchMedia(MEDIA_VIEWER_MEDIA_QUERY);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', forceUpdate);
    } else if (typeof mql.addListener === 'function') {
      mql.addListener(forceUpdate);
    }

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', forceUpdate);
      } else if (typeof mql.removeListener === 'function') {
        mql.removeListener(forceUpdate);
      }
    };
  }, [forceUpdate]);

  const prevMessage = usePrevious<ApiMessage | undefined>(message);
  const prevOrigin = usePrevious(origin);
  const prevAvatarOwner = usePrevious<ApiChat | ApiUser | undefined>(avatarOwner);
  useEffect(() => {
    if (isGhostAnimation && isOpen && !prevMessage && !prevAvatarOwner) {
      dispatchHeavyAnimationEvent(ANIMATION_DURATION);
      const textParts = message ? renderMessageText(message) : undefined;
      const hasFooter = Boolean(textParts);
      animateOpening(message!, hasFooter, origin!, bestImageData!);
    }

    if (isGhostAnimation && !isOpen && (prevMessage || prevAvatarOwner)) {
      dispatchHeavyAnimationEvent(ANIMATION_DURATION);
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

  function renderSlide(isActive: boolean) {
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
            localBlobUrl || fullMediaData || blobUrlPreview || blobUrlPictogram,
            message && calculateMediaViewerDimensions(photoDimensions!, hasFooter),
          )}
          {isVideo && (
            <VideoPlayer
              key={messageId}
              url={localBlobUrl || fullMediaData}
              isGif={isGif}
              posterData={blobUrlPreview || thumbDataUri}
              posterSize={message && calculateMediaViewerDimensions(videoDimensions!, hasFooter)}
              downloadProgress={downloadProgress}
              isMediaViewerOpen={isOpen}
              noPlay={!isActive}
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
