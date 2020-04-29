import React, { FC, useEffect, useState } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { selectChat } from '../../modules/selectors';
import { isChatChannel } from '../../modules/helpers';
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
  isChannel?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'openChat'>;

const MiddleColumn: FC<StateProps & DispatchProps> = ({
  openChatId,
  isChannel,
  openChat,
}) => {
  const [showFab, setShowFab] = useState(false);
  const prevChatId = usePrevious(openChatId, true);
  const prevIsChannel = usePrevious(isChannel, true);

  const isDesktop = window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN;

  const renderingChatId = isDesktop
    ? openChatId
    : openChatId || prevChatId;

  const renderingIsChannel = isDesktop
    ? isChannel
    : isChannel !== undefined ? isChannel : prevIsChannel;

  useEffect(() => {
    return openChatId
      ? captureEscKeyListener(() => {
        openChat({ id: undefined });
      })
      : undefined;
  }, [openChatId, openChat]);

  return (
    <div id="MiddleColumn">
      {renderingChatId && (
        <div className="messages-layout">
          <MiddleHeader chatId={renderingChatId} />
          <MessageList key={renderingChatId} chatId={renderingChatId} onFabToggle={setShowFab} />
          {!renderingIsChannel && <Composer />}
          <ScrollDownButton show={showFab} />
        </div>
      )}
    </div>
  );
};

export default withGlobal(
  (global): StateProps => {
    const { chats: { selectedId: openChatId, listIds } } = global;
    if (!listIds || !openChatId) {
      return {};
    }

    const chat = selectChat(global, openChatId);
    const isChannel = chat && isChatChannel(chat);

    return {
      openChatId,
      isChannel,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openChat']),
)(MiddleColumn);
