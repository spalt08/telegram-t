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
  if (!showRightColumn) {
    return null;
  }

  return (
    <div id="RightColumn">
      <RightHeader />
      {areChatsLoaded && selectedChatId && (
        <RightColumnInfo chatId={selectedChatId} />
      )}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { chats, showRightColumn } = global;

    const idsLength = chats.ids.length;
    const areChatsLoaded = idsLength > 0 && Object.keys(chats.byId).length >= idsLength;
    const selectedChatId = chats.selectedId;

    return {
      showRightColumn,
      selectedChatId,
      areChatsLoaded,
    };
  },
)(RightColumn);
