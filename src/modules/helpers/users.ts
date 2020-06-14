import { ApiUser } from '../../api/types';

import { formatFullDate, formatTime } from '../../util/dateFormat';
import { orderBy } from '../../util/iteratees';
import { SERVICE_NOTIFICATIONS_USER_ID } from '../../config';
import { isChatPrivate } from './chats';

export function getUserFirstName(user?: ApiUser) {
  if (!user) {
    return undefined;
  }

  switch (user.type) {
    case 'userTypeBot':
    case 'userTypeRegular': {
      return user.firstName;
    }

    case 'userTypeDeleted':
    case 'userTypeUnknown': {
      return 'Deleted';
    }

    default:
      return undefined;
  }
}

export function getUserFullName(user?: ApiUser) {
  if (!user) {
    return undefined;
  }

  if (isDeletedUser(user)) {
    return 'Deleted account';
  }

  switch (user.type) {
    case 'userTypeBot':
    case 'userTypeRegular': {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }

      if (user.firstName) {
        return user.firstName;
      }

      if (user.lastName) {
        return user.lastName;
      }

      break;
    }

    case 'userTypeDeleted':
    case 'userTypeUnknown': {
      return 'Deleted account';
    }
  }

  return undefined;
}

export function getUserStatus(user: ApiUser) {
  if (user.id === SERVICE_NOTIFICATIONS_USER_ID) {
    return 'service notifications';
  }

  if (user.type && user.type === 'userTypeBot') {
    return 'bot';
  }

  if (!user.status) {
    return '';
  }

  switch (user.status.type) {
    case 'userStatusEmpty': {
      return 'last seen a long time ago';
    }

    case 'userStatusLastMonth': {
      return 'last seen within a month';
    }

    case 'userStatusLastWeek': {
      return 'last seen within a week';
    }

    case 'userStatusOffline': {
      const { wasOnline } = user.status;

      if (!wasOnline) return 'offline';

      const now = new Date();
      const wasOnlineDate = new Date(wasOnline * 1000);

      if (wasOnlineDate >= now) {
        return 'last seen just now';
      }

      const diff = new Date(now.getTime() - wasOnlineDate.getTime());

      // within a minute
      if (diff.getTime() / 1000 < 60) {
        return 'last seen just now';
      }

      // within an hour
      if (diff.getTime() / 1000 < 60 * 60) {
        const minutes = Math.floor(diff.getTime() / 1000 / 60);
        return `last seen ${minutes === 1 ? '1 minute' : `${minutes} minutes`} ago`;
      }

      // today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (wasOnlineDate > today) {
        // up to 6 hours ago
        if (diff.getTime() / 1000 < 6 * 60 * 60) {
          const hours = Math.floor(diff.getTime() / 1000 / 60 / 60);
          return `last seen ${hours === 1 ? '1 hour' : `${hours} hours`} ago`;
        }

        // other
        return `last seen today at ${formatTime(wasOnlineDate)}`;
      }

      // yesterday
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      today.setHours(0, 0, 0, 0);
      if (wasOnlineDate > yesterday) {
        return `last seen yesterday at ${formatTime(wasOnlineDate)}`;
      }

      return `last seen ${formatFullDate(wasOnlineDate)}`;
    }

    case 'userStatusOnline': {
      return 'online';
    }

    case 'userStatusRecently': {
      return 'last seen recently';
    }

    default:
      return undefined;
  }
}

export function isUserOnline(user: ApiUser) {
  const { id, status, type } = user;

  if (!status) {
    return false;
  }

  if (id === SERVICE_NOTIFICATIONS_USER_ID) {
    return false;
  }

  return status.type === 'userStatusOnline' && type !== 'userTypeBot';
}

export function isDeletedUser(user: ApiUser) {
  if (!user.status || user.type === 'userTypeBot' || user.id === SERVICE_NOTIFICATIONS_USER_ID) {
    return false;
  }

  return user.type === 'userTypeDeleted'
    || user.type === 'userTypeUnknown'
    || user.status.type === 'userStatusEmpty';
}

export function isUserBot(user: ApiUser) {
  return user.type === 'userTypeBot';
}

export function getSenderName(chatId: number, sender?: ApiUser) {
  if (!sender || isChatPrivate(chatId)) {
    return undefined;
  }

  if (sender.isSelf) {
    return 'You';
  }

  return getUserFirstName(sender);
}

export function getSortedUserIds(
  userIds: number[],
  usersById: Record<number, ApiUser>,
  priorityIds?: number[],
) {
  return orderBy(userIds, (id) => {
    const now = Date.now() / 1000;

    if (priorityIds && priorityIds.includes(id)) {
      /*
      ** Assuming that online status expiration date can't be as far as two days from now,
      ** this should place priorityIds on top of the list.
      **
      ** We then subtract index of `id` in `priorityIds` to preserve selected order
      */
      return now + (48 * 60 * 60) - priorityIds.indexOf(id);
    }

    const user = usersById[id];
    if (!user || !user.status) {
      return 0;
    }

    if (user.status.type === 'userStatusOnline') {
      return user.status.expires;
    } else if (user.status.type === 'userStatusOffline' && user.status.wasOnline) {
      return user.status.wasOnline;
    }

    switch (user.status.type) {
      case 'userStatusRecently':
        return now - 60 * 60 * 24;
      case 'userStatusLastWeek':
        return now - 60 * 60 * 24 * 7;
      case 'userStatusLastMonth':
        return now - 60 * 60 * 24 * 7 * 30;
      default:
        return 0;
    }
  }, 'desc');
}
