import React, { FC, useEffect, useState } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { selectChat } from '../../modules/selectors';
import { isChatChannel } from '../../modules/helpers';
import captureEscKeyListener from '../../util/captureEscKeyListener';

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

  useEffect(() => {
    return openChatId
      ? captureEscKeyListener(() => {
        openChat({ id: undefined });
      })
      : undefined;
  }, [openChatId, openChat]);

  return (
    <div id="MiddleColumn">
      {openChatId && (
        <div className="messages-layout">
          <MiddleHeader chatId={openChatId} />
          <MessageList key={openChatId} onFabToggle={setShowFab} />
          {!isChannel && <Composer />}
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
  (setGlobal, actions): DispatchProps => {
    const { openChat } = actions;
    return { openChat };
  },
)(MiddleColumn);
