import { useEffect, useMemo } from '../lib/teact/teact';
import { getDispatch } from '../lib/teact/teactn';

import { ApiMessage, ApiUser } from '../api/types';

import { throttle } from '../util/schedulers';

export default (
  chatId: number,
  message?: ApiMessage,
  userId?: number,
  user?: ApiUser,
) => {
  const { loadUserFromMessage } = getDispatch();

  const messageId = message ? message.id : undefined;

  const loadUserThrottled = useMemo(() => {
    const throttled = throttle(loadUserFromMessage, 500, true);
    return () => {
      throttled({ chatId, messageId, userId });
    };
  }, [loadUserFromMessage, chatId, messageId, userId]);

  useEffect(() => {
    if (message && userId && !user) {
      loadUserThrottled();
    }
  });
};
