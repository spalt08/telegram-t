import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { selectChat } from '../../modules/selectors';
import { isChatChannel } from '../../modules/helpers';
import captureEscKeyListener from '../../util/captureEscKeyListener';

import MiddleHeader from './MiddleHeader';
import MessageList from './MessageList';
import Composer from './composer/Composer';

import './MiddleColumn.scss';

type IProps = {
  openChatId?: number;
  isChannel?: boolean;
} & Pick<GlobalActions, 'openChat'>;

const MiddleColumn: FC<IProps> = ({ openChatId, isChannel, openChat }) => {
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
          <MessageList key={openChatId} />
          {!isChannel && <Composer />}
        </div>
      )}
    </div>
  );
};

export default withGlobal(
  (global) => {
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
  (setGlobal, actions) => {
    const { openChat } = actions;
    return { openChat };
  },
)(MiddleColumn);
