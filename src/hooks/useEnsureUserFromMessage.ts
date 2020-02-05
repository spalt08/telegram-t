import { useEffect, useMemo } from '../lib/teact/teact';
import { getDispatch } from '../lib/teact/teactn';

import { ApiUser } from '../api/types';

import { throttle } from '../util/schedulers';

export default (
  chatId: number,
  messageId?: number,
  userId?: number,
  user?: ApiUser,
) => {
  const { loadUserFromMessage } = getDispatch();
  const loadUserThrottled = useMemo(() => {
    const throttled = throttle(loadUserFromMessage, 500, true);
    return () => {
      throttled({ chatId, messageId, userId });
    };
  }, [loadUserFromMessage, chatId, messageId, userId]);

  useEffect(() => {
    if (userId && !user && messageId) {
      loadUserThrottled();
    }
  }, [messageId, userId, user, loadUserThrottled]);
};
