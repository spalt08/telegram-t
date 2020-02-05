import { useEffect, useMemo } from '../lib/teact/teact';
import { getDispatch } from '../lib/teact/teactn';

import { ApiMessage } from '../api/types';

import { throttle } from '../util/schedulers';

export default (
  chatId: number,
  messageId?: number,
  message?: ApiMessage,
) => {
  const { loadMessage } = getDispatch();
  const loadMessageThrottled = useMemo(() => {
    const throttled = throttle(loadMessage, 500, true);
    return () => {
      throttled({ chatId, messageId });
    };
  }, [loadMessage, chatId, messageId]);

  useEffect(() => {
    if (messageId && !message) {
      loadMessageThrottled();
    }
  }, [message, messageId, loadMessageThrottled]);
};
