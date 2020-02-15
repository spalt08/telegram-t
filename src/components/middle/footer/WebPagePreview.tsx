import React, { FC, memo, useEffect } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../../../global/types';
import { ApiMessage } from '../../../api/types';

import { throttle } from '../../../util/schedulers';

import WebPage from '../message/WebPage';

import './WebPagePreview.scss';

type IProps = {
  messageText: string;
} & Pick<GlobalState, 'webPagePreview'> & Pick<GlobalActions, 'loadWebPagePreview' | 'clearWebPagePreview'>;

const RE_LINK = /https?:\/\/(www.)?([a-zA-Z0-9.-]{2,256})([a-zA-Z/.-]{1,256})([?|#]{1}[=&#a-zA-Z0-9]{2,128})?/;

const runThrottledForWebPagePreview = throttle((cb) => cb(), 1000, true);

const WebPagePreview: FC<IProps> = ({
  messageText,
  webPagePreview,
  loadWebPagePreview,
  clearWebPagePreview,
}) => {
  const hasPreview = Boolean(webPagePreview);

  useEffect(() => {
    if (messageText.length && messageText.match(RE_LINK)) {
      runThrottledForWebPagePreview(() => loadWebPagePreview({ text: messageText }));
    } else {
      clearWebPagePreview();
    }
  }, [clearWebPagePreview, loadWebPagePreview, messageText, hasPreview]);

  if (!webPagePreview) {
    return null;
  }

  // TODO Refactor so the `WebPage` can be used without message
  const { photo, ...webPageWithoutPhoto } = webPagePreview;
  const messageStub = {
    content: {
      webPage: webPageWithoutPhoto,
    },
  } as ApiMessage;

  return (
    <div className="WebPagePreview">
      <WebPage message={messageStub} />
    </div>
  );
};

export default memo(withGlobal(
  (global) => {
    const { webPagePreview } = global;
    return { webPagePreview };
  },
  (setGlobal, actions) => {
    const { loadWebPagePreview, clearWebPagePreview } = actions;
    return { loadWebPagePreview, clearWebPagePreview };
  },
)(WebPagePreview));
