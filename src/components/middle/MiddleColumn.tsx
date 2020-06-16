import React, {
  FC, useEffect, useState, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat, ApiUser } from '../../api/types';

import { selectChat, selectUser } from '../../modules/selectors';
import {
  getCanPostInChat,
  getMessageSendingRestrictionReason,
  isChatPrivate,
  getPrivateChatUserId,
} from '../../modules/helpers';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import { pick } from '../../util/iteratees';
import usePrevious from '../../hooks/usePrevious';
import { MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN } from '../../config';

import MiddleHeader from './MiddleHeader';
import MessageList from './MessageList';
import ScrollDownButton from './ScrollDownButton';
import Composer from './composer/Composer';

import './MiddleColumn.scss';

type StateProps = {
  openChatId?: number;
  canPost?: boolean;
  messageSendingRestrictionReason?: string;
  hasPinnedMessage?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'openChat'>;

const MiddleColumn: FC<StateProps & DispatchProps> = ({
  openChatId,
  canPost,
  messageSendingRestrictionReason,
  hasPinnedMessage,
  openChat,
}) => {
  const [showFab, setShowFab] = useState(false);
  const prevChatId = usePrevious(openChatId, true);
  const prevCanPost = usePrevious(canPost, true);

  const renderingChatId = window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN
    ? openChatId
    : openChatId || prevChatId;

  const renderingCanPost = window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN
    ? canPost
    : canPost || prevCanPost;

  useEffect(() => {
    return openChatId
      ? captureEscKeyListener(() => {
        openChat({ id: undefined });
      })
      : undefined;
  }, [openChatId, openChat]);

  return (
    <div id="MiddleColumn" className={hasPinnedMessage ? 'has-pinned-message' : undefined}>
      <div id="middle-column-portals" />
      {renderingChatId && (
        <div className="messages-layout">
          <MiddleHeader chatId={renderingChatId} />
          <MessageList key={renderingChatId} chatId={renderingChatId} onFabToggle={setShowFab} />
          {renderingCanPost && <Composer />}
          {!renderingCanPost && messageSendingRestrictionReason && (
            <div className="messaging-disabled">
              <span>{messageSendingRestrictionReason}</span>
            </div>
          )}
          <ScrollDownButton show={showFab} />
        </div>
      )}
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const { chats: { selectedId: openChatId, listIds } } = global;
    if (!listIds.active || !openChatId) {
      return {};
    }

    const chat = selectChat(global, openChatId);
    let target: ApiChat | ApiUser | undefined = chat;
    if (isChatPrivate(openChatId)) {
      const id = chat && getPrivateChatUserId(chat);
      target = id ? selectUser(global, id) : undefined;
    }

    const { pinnedMessageId } = (target && target.fullInfo) || {};

    return {
      openChatId,
      canPost: !chat || getCanPostInChat(chat),
      messageSendingRestrictionReason: chat && getMessageSendingRestrictionReason(chat),
      hasPinnedMessage: Boolean(pinnedMessageId),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openChat']),
)(MiddleColumn));
