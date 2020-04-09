import React, { FC, memo, useEffect } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../../../global/types';
import { ApiMessage } from '../../../api/types';

import { throttle } from '../../../util/schedulers';
import parseMessageInput from './helpers/parseMessageInput';

import WebPage from '../message/WebPage';

import './WebPagePreview.scss';

type OwnProps = {
  messageText: string;
};

type StateProps = Pick<GlobalState, 'webPagePreview'>;
type DispatchProps = Pick<GlobalActions, 'loadWebPagePreview' | 'clearWebPagePreview'>;

const RE_LINK = /https?:\/\/(www.)?([a-zA-Z0-9.-]{2,256})([a-zA-Z/.-]{1,256})([?|#][=&#a-zA-Z0-9]{2,128})?/;

const runThrottledForWebPagePreview = throttle((cb) => cb(), 1000, true);

const WebPagePreview: FC<OwnProps & StateProps & DispatchProps> = ({
  messageText,
  webPagePreview,
  loadWebPagePreview,
  clearWebPagePreview,
}) => {
  const hasPreview = Boolean(webPagePreview);

  useEffect(() => {
    const { text } = parseMessageInput(messageText);
    if (text.length && text.match(RE_LINK)) {
      runThrottledForWebPagePreview(() => loadWebPagePreview({ text }));
    } else {
      clearWebPagePreview();
    }
  }, [clearWebPagePreview, loadWebPagePreview, messageText, hasPreview]);

  if (!webPagePreview || !messageText.length) {
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
      <WebPage message={messageStub} inPreview />
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { webPagePreview } = global;
    return { webPagePreview };
  },
  (setGlobal, actions): DispatchProps => {
    const { loadWebPagePreview, clearWebPagePreview } = actions;
    return { loadWebPagePreview, clearWebPagePreview };
  },
)(WebPagePreview));
