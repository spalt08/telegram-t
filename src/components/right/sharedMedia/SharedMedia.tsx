import React, {
  FC, useState, memo, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';
import { GlobalActions } from '../../../global/types';

import { ApiMessage } from '../../../api/types';

import { selectChatMessages } from '../../../modules/selectors';
import { getMessageContentIds } from '../../../modules/helpers';

import TabList from '../../ui/TabList';
import WebPage from '../../middle/message/WebPage';
import Document from './Document';
import Media from './Media';
import Audio from './Audio';

import './SharedMedia.scss';


type IProps = {
  chatMessages: Record<number, ApiMessage>;
} & Pick<GlobalActions, 'selectMediaMessage'>;

const TABS = [
  'Media',
  'Docs',
  'Links',
  'Audio',
];

const CONTENT = [
  'media',
  'document',
  'webPage',
  'audio',
] as const;

const SharedMedia: FC<IProps> = ({ chatMessages, selectMediaMessage }) => {
  const [activeTab, setActiveTab] = useState(0);
  const currentContent = CONTENT[activeTab];
  const messageIds = useMemo(
    () => (chatMessages ? getMessageContentIds(chatMessages, currentContent).reverse() : []),
    [chatMessages, currentContent],
  );

  const handleSelectMedia = useCallback((id) => {
    selectMediaMessage({ id, isReversed: true });
  }, [selectMediaMessage]);

  return (
    <div className="SharedMedia">
      <div className={`content ${(TABS[activeTab] || '').toLowerCase()}`}>
        {/* eslint-disable no-nested-ternary */}
        {currentContent === 'media' ? (
          renderMediaList(handleSelectMedia, messageIds, chatMessages)
        ) : currentContent === 'document' ? (
          renderDocumentList(messageIds, chatMessages)
        ) : currentContent === 'webPage' ? (
          renderWebPageList(messageIds, chatMessages)
        ) : currentContent === 'audio' ? (
          renderAudioList(messageIds, chatMessages)
        ) : null}
        {/* eslint-enable no-nested-ternary */}
      </div>
      <TabList activeTab={activeTab} tabs={TABS} onSwitchTab={setActiveTab} />
    </div>
  );
};

function renderMediaList(
  handleSelectMedia: (id: number) => void, messageMediaIds: number[], messages: Record<number, ApiMessage>,
) {
  return messageMediaIds.map((id: number) => (
    <Media
      key={id}
      message={messages[id]}
      onClick={handleSelectMedia}
    />
  ));
}

function renderDocumentList(messageDocumentIds: number[], messages: Record<number, ApiMessage>) {
  return messageDocumentIds.map((id: number) => (
    <Document key={id} message={messages[id]} />
  ));
}

function renderWebPageList(messageWebPageIds: number[], messages: Record<number, ApiMessage>) {
  return messageWebPageIds.map((id: number) => (
    <WebPage
      key={id}
      message={messages[id]}
      load
      showUrl
    />
  ));
}

function renderAudioList(messageAudioIds: number[], messages: Record<number, ApiMessage>) {
  return messageAudioIds.map((id: number) => (
    <Audio key={id} message={messages[id]} />
  ));
}

export default memo(withGlobal(
  (global) => {
    const { chats, users } = global;

    const selectedChatId = users.selectedId || chats.selectedId;
    if (!selectedChatId) {
      return {};
    }

    return {
      chatMessages: selectChatMessages(global, selectedChatId),
    };
  },
  (setGlobal, actions) => {
    const { selectMediaMessage } = actions;
    return { selectMediaMessage };
  },
)(SharedMedia));
