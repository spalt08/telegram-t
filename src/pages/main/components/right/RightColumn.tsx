import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import RightHeader from './RightHeader';
import RightColumnInfo from './RightColumnInfo';
import './RightColumn.scss';

type IProps = {
  showRightColumn: boolean;
  areChatsLoaded: boolean;
  selectedChatId?: number;
  selectedUserId?: number;
};

const RightColumn: FC<IProps> = ({
  showRightColumn, areChatsLoaded, selectedChatId, selectedUserId,
}) => {
  if (!showRightColumn || !selectedChatId) {
    return null;
  }

  return (
    <div id="RightColumn">
      <RightHeader />
      {areChatsLoaded && (
        <RightColumnInfo chatId={selectedChatId} userId={selectedUserId} />
      )}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { chats, users, showRightColumn } = global;

    const areChatsLoaded = Boolean(chats.ids);
    const selectedChatId = chats.selectedId;
    const selectedUserId = users.selectedId;

    return {
      showRightColumn,
      selectedChatId,
      selectedUserId,
      areChatsLoaded,
    };
  },
)(RightColumn);
