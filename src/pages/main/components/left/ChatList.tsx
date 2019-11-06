import React, { FC } from '../../../../lib/reactt';
import { DispatchMap, GlobalState, withGlobal } from '../../../../lib/reactnt';
import Chat from './Chat';

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
        <div>Loading...</div>
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
