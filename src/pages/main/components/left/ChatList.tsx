import React, { FC } from '../../../../lib/teact';
import { DispatchMap, GlobalState, withGlobal } from '../../../../lib/teactn';
import Chat from './Chat';

import Loading from '../../../../components/Loading';

import './ChatList.scss';

type IProps = Pick<GlobalState, 'chats'> & Pick<DispatchMap, 'loadChats'> & {
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
          {Object.keys(chats.byId).map(id => (
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
    const { chats } = global;
    return {
      chats,
      areChatsLoaded: Object.keys(chats.byId).length,
    };
  },
  (setGlobal, actions) => {
    const { loadChats } = actions;
    return { loadChats };
  },
)(ChatList);
