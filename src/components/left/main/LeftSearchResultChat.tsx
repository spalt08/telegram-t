import React, {
  FC, useState, useCallback, memo,
} from '../../../lib/teact/teact';

import { ApiChat, ApiUser } from '../../../api/types';

import useChatContextActions from '../../../hooks/useChatContextActions';
import { isChatPrivate, getPrivateChatUserId } from '../../../modules/helpers';

import PrivateChatInfo from '../../common/PrivateChatInfo';
import GroupChatInfo from '../../common/GroupChatInfo';
import DeleteChatModal from '../../common/DeleteChatModal';
import ListItem from '../../ui/ListItem';
import { withGlobal } from '../../../lib/teact/teactn';
import { selectChat, selectUser, selectIsChatPinned } from '../../../modules/selectors';

type OwnProps = {
  chatId: number;
  showHandle?: boolean;
  onClick: () => void;
};

type StateProps = {
  chat?: ApiChat;
  privateChatUser?: ApiUser;
  isPinned?: boolean;
};

const LeftSearchResultChat: FC<OwnProps & StateProps> = ({
  chatId,
  chat,
  privateChatUser,
  isPinned,
  showHandle,
  onClick,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const contextActions = useChatContextActions({
    chat,
    privateChatUser,
    isPinned,
    handleDelete,
  });

  if (!chat) {
    return undefined;
  }

  return (
    <ListItem
      className="chat-item-clickable search-result"
      onClick={onClick}
      contextActions={contextActions}
    >
      {isChatPrivate(chatId) ? (
        <PrivateChatInfo userId={chatId} showHandle={showHandle} avatarSize="large" />
      ) : (
        <GroupChatInfo chatId={chatId} showHandle={showHandle} avatarSize="large" />
      )}
      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        chat={chat}
      />
    </ListItem>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);
    const privateChatUserId = chat && getPrivateChatUserId(chat);
    const privateChatUser = privateChatUserId ? selectUser(global, privateChatUserId) : undefined;
    const isPinned = selectIsChatPinned(global, chatId);

    return {
      chat,
      privateChatUser,
      isPinned,
    };
  },
)(LeftSearchResultChat));
