import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiPrivateChat } from '../../../../api/types';
import { getPrivateChatUserId, isPrivateChat } from '../../../../modules/helpers';
import { selectChat } from '../../../../modules/selectors';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import HeaderActions from './HeaderActions';

import './MiddleHeader.scss';

type IProps = {
  chatId: number;
  userId?: number;
} & Pick<GlobalActions, 'selectChatToView'>;

const MiddleHeader: FC<IProps> = ({ chatId, userId, selectChatToView }) => {
  function onHeaderClick() {
    selectChatToView({ id: chatId, forceOpen: true });
  }

  return (
    <div className="MiddleHeader" onClick={onHeaderClick}>
      {userId ? (
        <PrivateChatInfo userId={userId} />
      ) : (
        <GroupChatInfo chatId={chatId} />
      )}
      <HeaderActions />
    </div>
  );
};

export default withGlobal(
  (global, { chatId }: IProps) => {
    if (isPrivateChat(chatId)) {
      const chat = selectChat(global, chatId) as ApiPrivateChat | undefined;
      const id = chat && getPrivateChatUserId(chat);
      return { selectedUserId: id };
    }

    return null;
  },
  (setGlobal, actions) => {
    const { selectChatToView } = actions;
    return { selectChatToView };
  },
)(MiddleHeader);
