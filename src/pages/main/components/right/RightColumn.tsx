import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';


import RightHeader from './RightHeader';
import RightColumnInfo from './RightColumnInfo';
import './RightColumn.scss';

type IProps = {
  showRightColumn: boolean;
  areChatsLoaded: boolean;
  selectedChatId: number;
};

const RightColumn: FC<IProps> = ({ showRightColumn, areChatsLoaded, selectedChatId }) => {
  if (!showRightColumn || !selectedChatId) {
    return null;
  }

  return (
    <div id="RightColumn">
      <RightHeader />
      {areChatsLoaded && (
        <RightColumnInfo chatId={selectedChatId} />
      )}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { chats, showRightColumn } = global;

    const areChatsLoaded = Boolean(chats.ids);
    const selectedChatId = chats.selectedId;

    return {
      showRightColumn,
      selectedChatId,
      areChatsLoaded,
    };
  },
)(RightColumn);
