import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import { ApiChat } from '../../../../modules/tdlib/types';
import toArray from '../../../../util/toArray';
import orderBy from '../../../../util/orderBy';
import Chat from './Chat';
import Loading from '../../../../components/Loading';
import './ChatList.scss';

type IProps = Pick<DispatchMap, 'loadChats'> & {
  chats: Record<number, ApiChat>,
  areChatsLoaded: boolean;
};

const ChatList: FC<IProps> = ({ chats, areChatsLoaded, loadChats }) => {
  if (!areChatsLoaded) {
    loadChats();
  }

  const chatsArray = areChatsLoaded && chats
    ? orderBy(toArray(chats), (chat) => chat.last_message && chat.last_message.date)
    : undefined;

  return (
    <div className="ChatList">{
      areChatsLoaded && chatsArray ? (
        <div>
          {chatsArray.map(({ id }) => (
            <Chat key={id} id={id} />
          ))}
        </div>
      ) : (
        <Loading />
      )
    }
    </div>
  );
};

export default withGlobal(
  global => {
    const { chats } = global;
    const idsLength = chats.ids.length;
    const areChatsLoaded = idsLength > 0 && Object.keys(chats.byId).length >= idsLength;

    return {
      areChatsLoaded,
      chats: chats.byId,
    };
  },
  (setGlobal, actions) => {
    const { loadChats } = actions;
    return { loadChats };
  },
)(ChatList);
