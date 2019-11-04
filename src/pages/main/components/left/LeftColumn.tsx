import React, { FC } from '../../../../lib/reactt';
import { DispatchMap, GlobalState, withGlobal } from '../../../../lib/reactnt';
import Chat from './Chat';

type IProps = Pick<GlobalState, 'chats'> & Pick<DispatchMap, 'loadChats'>

const LeftColumn: FC<IProps> = ({ chats, loadChats }) => {
  if (!chats) {
    // TODO use effect
    loadChats();
  }

  return chats && chats.byId ? (
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
    return { chats };
  },
  (setGlobal, actions) => {
    const { loadChats } = actions;
    return { loadChats };
  },
)(LeftColumn);
