import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';

import captureEscKeyListener from '../../util/captureEscKeyListener';

import RightHeader from './RightHeader';
import RightColumnInfo from './RightColumnInfo';

import './RightColumn.scss';

type IProps = {
  showRightColumn: boolean;
  areChatsLoaded: boolean;
  selectedChatId?: number;
  selectedUserId?: number;
} & Pick<GlobalActions, 'toggleRightColumn'>;

const RightColumn: FC<IProps> = ({
  showRightColumn, areChatsLoaded, selectedChatId, selectedUserId, toggleRightColumn,
}) => {
  const isOpen = showRightColumn && selectedChatId;

  useEffect(() => (isOpen ? captureEscKeyListener(toggleRightColumn) : undefined), [toggleRightColumn, isOpen]);

  if (!isOpen) {
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
  (setGlobal, actions) => {
    const { toggleRightColumn } = actions;
    return { toggleRightColumn };
  },
)(RightColumn);
