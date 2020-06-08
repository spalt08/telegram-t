import React, { FC, memo, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';

import { selectCurrentStickerSearch, selectChat, selectIsChatWithBot } from '../../modules/selectors';
import { getAllowedAttachmentOptions } from '../../modules/helpers';
import { pick } from '../../util/iteratees';
import { throttle } from '../../util/schedulers';

import Loading from '../ui/Loading';
import StickerSetResult from './StickerSetResult';

import './StickerSearch.scss';

type StateProps = {
  query?: string;
  featuredIds?: string[];
  resultIds?: string[];
  chat?: ApiChat;
  isChatWithBot?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'loadFeaturedStickers'>;

const runThrottled = throttle((cb) => cb(), 60000, true);

const StickerSearch: FC<StateProps & DispatchProps> = ({
  query,
  featuredIds,
  resultIds,
  chat,
  isChatWithBot,
  loadFeaturedStickers,
}) => {
  // Due to the parent Transition, this component never gets unmounted,
  // that's why we use throttled API call on every update.
  useEffect(() => {
    runThrottled(() => {
      loadFeaturedStickers();
    });
  });

  const { canSendStickers } = getAllowedAttachmentOptions(chat, isChatWithBot);

  function renderContent() {
    if (!query && featuredIds) {
      return featuredIds.map((id) => (
        <StickerSetResult key={id} setId={id} canSendStickers={canSendStickers} />
      ));
    }

    if (resultIds) {
      if (!resultIds.length) {
        return <p className="helper-text">Nothing found.</p>;
      }

      return resultIds.map((id) => (
        <StickerSetResult key={id} setId={id} canSendStickers={canSendStickers} />
      ));
    }

    return <Loading />;
  }

  return (
    <div className="StickerSearch custom-scroll">
      {renderContent()}
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const currentSearch = selectCurrentStickerSearch(global);
    const { query, resultIds } = currentSearch || {};
    const { featured } = global.stickers;

    const chatId = global.chats.selectedId;
    const chat = chatId ? selectChat(global, chatId) : undefined;
    const isChatWithBot = chatId ? selectIsChatWithBot(global, chatId) : undefined;

    return {
      query,
      featuredIds: featured.setIds,
      resultIds,
      chat,
      isChatWithBot,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadFeaturedStickers']),
)(StickerSearch));
