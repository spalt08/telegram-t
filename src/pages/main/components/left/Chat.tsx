import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';
import { ApiChat } from '../../../../modules/tdlib/types/chats';
import { getMessageText, isPrivate } from '../../../../modules/tdlib/helpers';
import Avatar from '../../../../components/Avatar';
import LastMessageMeta from './LastMessageMeta';
import Badge from './Badge';
import './Chat.scss';

type IProps = {
  id: number,
  chat: ApiChat,
  isSelected: boolean,
} & Pick<DispatchMap, 'selectChat'>;

const Chat: FC<IProps> = ({ chat, isSelected, selectChat }) => {
  return (
    <div className={buildClassNames(chat, isSelected)} onClick={() => selectChat({ id: chat.id })}>
      <Avatar chat={chat} />
      <div className="info">
        <div className="title">
          <h3>{chat.title}</h3>
          {chat.last_message && (
            <LastMessageMeta message={chat.last_message} />
          )}
        </div>
        <div className="subtitle">
          {chat.last_message && (
            <p className="last-message">{getMessageText(chat.last_message)}</p>
          )}
          <Badge chat={chat} />
        </div>
      </div>
    </div>
  );
};

function buildClassNames(chat: ApiChat, isSelected: boolean) {
  const classNames = ['Chat'];

  classNames.push(isPrivate(chat.id) ? 'private' : 'group');

  if (isSelected) {
    classNames.push('selected');
  }

  return classNames.join(' ');
}

export default withGlobal(
  (global, ownProps) => {
    const { chats } = global;
    const { id } = ownProps;

    return {
      chat: chats.byId[id],
      isSelected: Number(id) === chats.selectedId,
    };
  },
  (setGlobal, actions) => {
    const { selectChat } = actions;
    return { selectChat };
  },
)(Chat);
