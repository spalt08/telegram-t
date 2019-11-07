import React, { FC } from '../../../../lib/teact';
import { DispatchMap, GlobalState, withGlobal } from '../../../../lib/teactn';

import { ApiChat } from '../../../../modules/tdlib/types/chats';

import Chat from './Chat';

import Loading from '../../../../components/Loading';

import './ChatList.scss';
import toArray from '../../../../util/toArray';
import orderBy from '../../../../util/orderBy';

type IProps = Pick<DispatchMap, 'loadChats'> & {
  chats: ApiChat[],
  areChatsLoaded: boolean;
};

const ChatList: FC<IProps> = ({ chats, areChatsLoaded, loadChats }) => {
  if (!areChatsLoaded) {
    loadChats();
  }

  return (
    <div className="ChatList">{
      areChatsLoaded ? (
        <div>
          {chats.map(({ id }) => (
            <Chat key={id} id={id} />
            ))}
        </div>
      ) : (
        <Loading />
      )
    }</div>
  );
};

export default withGlobal(
  global => {
    const chats = toArray(global.chats.byId);
    const areChatsLoaded = Boolean(chats.length);
    const sortedChats = areChatsLoaded
      ? orderBy(chats, chat => chat.last_message && chat.last_message.date)
      : null;

    return {
      // TODO @perf New object returned each time.
      chats: sortedChats,
      areChatsLoaded,
    };
  },
  (setGlobal, actions) => {
    const { loadChats } = actions;
    return { loadChats };
  },
)(ChatList);
