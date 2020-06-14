import React, {
  FC, memo, useState, useMemo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiChatFolder, ApiChat, ApiUser } from '../../../api/types';
import { GlobalActions } from '../../../global/types';

import { pick } from '../../../util/iteratees';
import { getFolderUnreadDialogs } from '../../../modules/helpers';

import Transition from '../../ui/Transition';
import TabList, { TabWithProperties } from '../../ui/TabList';
import ChatList from './ChatList';

type StateProps = {
  chatsById: Record<number, ApiChat>;
  usersById: Record<number, ApiUser>;
  chatFoldersById: Record<number, ApiChatFolder>;
  orderedFolderIds?: number[];
  lastSyncTime?: number;
};

type DispatchProps = Pick<GlobalActions, 'loadChatFolders'>;

const ChatFolders: FC<StateProps & DispatchProps> = ({
  chatsById,
  usersById,
  chatFoldersById,
  orderedFolderIds,
  lastSyncTime,
  loadChatFolders,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (lastSyncTime) {
      loadChatFolders();
    }
  }, [lastSyncTime, loadChatFolders]);

  const folderTabs = useMemo((): TabWithProperties[] => {
    const chatFoldersArray = Object.values(chatFoldersById);
    if (!chatFoldersArray.length) {
      return [];
    }

    const displayedFolders = orderedFolderIds
      ? orderedFolderIds.map((id) => chatFoldersById[id] || {}).filter(Boolean)
      : chatFoldersArray;

    const displayedFolderTabs: TabWithProperties[] = displayedFolders.map((folder) => {
      const { unreadDialogsCount, hasActiveDialogs } = getFolderUnreadDialogs(
        chatsById, usersById, folder,
      ) || {};

      return {
        title: folder.title,
        badgeCount: unreadDialogsCount,
        isBadgeActive: hasActiveDialogs,
      };
    });

    return [
      { title: 'All' },
      ...displayedFolderTabs,
    ];
  }, [chatFoldersById, orderedFolderIds, chatsById, usersById]);

  const handleSwitchTab = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  // Prevent `activeTab` pointing at non-existing folder after update
  useEffect(() => {
    if (activeTab >= folderTabs.length) {
      setActiveTab(0);
    }
  }, [activeTab, folderTabs]);

  function renderCurrentTab() {
    const activeFolder = Object.values(chatFoldersById)
      .find(({ title }) => title === folderTabs[activeTab].title);

    if (!activeFolder || activeTab === 0) {
      return <ChatList folderType="all" />;
    }

    return <ChatList folderType="folder" folderId={activeFolder.id} noChatsText="Folder is empty." />;
  }

  return (
    <div className="ChatFolders">
      {Boolean(folderTabs.length) && (
        <TabList tabs={folderTabs} activeTab={activeTab} onSwitchTab={handleSwitchTab} />
      )}
      <Transition name="slide" activeKey={activeTab} renderCount={folderTabs.length || undefined}>
        {renderCurrentTab}
      </Transition>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const {
      chats: { byId: chatsById },
      users: { byId: usersById },
      chatFolders: {
        byId: chatFoldersById,
        orderedIds: orderedFolderIds,
      },
      lastSyncTime,
    } = global;

    return {
      chatsById,
      usersById,
      chatFoldersById,
      orderedFolderIds,
      lastSyncTime,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadChatFolders']),
)(ChatFolders));
