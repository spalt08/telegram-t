import React, {
  FC, useEffect, useState, memo,
} from '../../../../lib/teact';
import usePrevious from '../../../../hooks/usePrevious';
import { withGlobal } from '../../../../lib/teactn';
import { selectChatMessage, selectChatMessages } from '../../../../modules/selectors';
import { GlobalActions } from '../../../../store/types';
import { getChatMediaMessageIds, getMessageMediaHash } from '../../../../modules/helpers';
import * as mediaLoader from '../../../../util/mediaLoader';
import { buildMessageContent } from '../middle/message/utils';
import { ApiMessage } from '../../../../api/types';

import Spinner from '../../../../components/Spinner';
import AnimationFade from '../../../../components/ui/AnimationFade';
import SenderInfo from './SenderInfo';
import MediaViewerActions from './MediaViewerActions';
import MediaViewerFooter from './MediaViewerFooter';
import './MediaViewer.scss';

type IProps = Pick<GlobalActions, 'selectMediaMessage'> & {
  chatId?: number;
  selectedMediaMessageId?: number;
  mediaHash?: string;
  messageText?: string;
  chatMessages: Record<number, ApiMessage>;
};

const MediaViewer: FC<IProps> = ({
  chatId, selectedMediaMessageId, mediaHash, messageText, chatMessages, selectMediaMessage,
}) => {
  const messageIds = getChatMediaMessageIds(chatMessages || {});
  const selectedMediaMessageIndex = selectedMediaMessageId && messageIds.indexOf(selectedMediaMessageId);
  const isFirst = selectedMediaMessageIndex === undefined || selectedMediaMessageIndex === 0;
  const isLast = selectedMediaMessageIndex === undefined || selectedMediaMessageIndex === messageIds.length - 1;

  const [, onDataUriUpdate] = useState(null);
  const dataUri = mediaHash ? mediaLoader.getFromMemory(mediaHash) : undefined;

  // For correct unmount animation
  const previousProps = usePrevious({
    dataUri,
    messageText,
    chatId,
    selectedMediaMessageId,
  });

  const {
    dataUri: previousDataUri,
    messageText: previousMessageText,
    chatId: previousChatId,
    selectedMediaMessageId: previousMediaMessageId,
  } = previousProps;

  useEffect(() => {
    if (mediaHash && !dataUri) {
      mediaLoader.fetch(mediaHash).then(onDataUriUpdate);
    }
  }, [mediaHash, dataUri]);

  const getMessageId = (fromId: number, direction: number): number => {
    let index = messageIds.indexOf(fromId);
    if ((direction === -1 && index > 0) || (direction === 1 && index < messageIds.length - 1)) {
      index += direction;
    }

    return messageIds[index];
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'Esc': // IE/Edge specific value
      case 'Escape':
        closeMediaViewer();
        break;

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

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  });

  function handleClose(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
    e.stopPropagation();
    const { classList } = e.target as HTMLElement;

    if (!classList.contains('navigation') || classList.contains('media-viewer-footer')) {
      closeMediaViewer();
    }
  }

  function stopEvent(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    e.stopPropagation();
  }

  function selectPreviousMedia(): void {
    selectMediaMessage({ id: selectedMediaMessageId ? getMessageId(selectedMediaMessageId, -1) : null });
  }

  function selectNextMedia(): void {
    selectMediaMessage({ id: selectedMediaMessageId ? getMessageId(selectedMediaMessageId, 1) : null });
  }

  function closeMediaViewer(): void {
    selectMediaMessage({ id: null });
  }

  return (
    <AnimationFade show={Boolean(selectedMediaMessageId)}>
      <div id="MediaViewer" onClick={handleClose}>
        <div className="media-viewer-head" onClick={stopEvent}>
          <SenderInfo chatId={chatId || previousChatId} messageId={selectedMediaMessageId || previousMediaMessageId} />
          <MediaViewerActions onCloseMediaViewer={closeMediaViewer} />
        </div>
        <div className="media-viewer-content">
          {selectedMediaMessageId && dataUri && <img src={dataUri} alt="" />}
          {selectedMediaMessageId && !dataUri && <Spinner color="white" />}
          {!selectedMediaMessageId && previousDataUri && <img src={previousDataUri} alt="" />}
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
        <MediaViewerFooter text={selectedMediaMessageId ? messageText : previousMessageText} />
      </div>
    </AnimationFade>
  );
};

export default memo(withGlobal(
  (global) => {
    const { chats: { selectedId: chatId }, messages: { selectedMediaMessageId } } = global;
    if (!chatId || !selectedMediaMessageId) {
      return {};
    }

    const chatMessages = selectChatMessages(global, chatId);
    const message = selectChatMessage(global, chatId, selectedMediaMessageId);
    const mediaHash = message && getMessageMediaHash(message);

    let messageText;
    if (message) {
      const { text } = buildMessageContent(message);
      messageText = text;
    }

    return {
      chatId: message && message.chat_id,
      selectedMediaMessageId,
      mediaHash,
      messageText,
      chatMessages,
    };
  },
  (setGlobal, actions) => {
    const { selectMediaMessage } = actions;
    return { selectMediaMessage };
  },
)(MediaViewer));
