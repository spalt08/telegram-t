import React, { FC } from '../../../../lib/reactt';
import { DispatchMap, GlobalState, withGlobal } from '../../../../lib/reactnt';
import Chat from './Chat';

type IProps = Pick<GlobalState, 'chats'> & Pick<DispatchMap, 'loadChats'> & {
  areChatsLoaded: boolean;
};

const LeftColumn: FC<IProps> = ({ chats, areChatsLoaded, loadChats }) => {
  if (!areChatsLoaded) {
    loadChats();
  }

  return areChatsLoaded ? (
    <div>
      {Object.keys(chats.byId).map((id) => (
        <div>
          <Chat key={id} id={id} />
        </div>
      ))}
    </div>
  ) : (
    <div>Loading...</div>
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
)(LeftColumn);
