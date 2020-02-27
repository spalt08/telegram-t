import { ApiUser } from '../../api/types';
import { formatFullDate, formatTime } from '../../util/dateFormat';

const SERVICE_NOTIFICATIONS_USER_ID = 777000;

export function getUserFirstName(user?: ApiUser) {
  if (!user) {
    return null;
  }

  switch (user.type['@type']) {
    case 'userTypeBot':
    case 'userTypeRegular': {
      return user.first_name;
    }

    case 'userTypeDeleted':
    case 'userTypeUnknown': {
      return 'Deleted';
    }
  }

  return null;
}

export function getUserFullName(user?: ApiUser) {
  if (!user) {
    return undefined;
  }

  if (isDeletedUser(user)) {
    return 'Deleted account';
  }

  switch (user.type['@type']) {
    case 'userTypeBot':
    case 'userTypeRegular': {
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }

      if (user.first_name) {
        return user.first_name;
      }

      if (user.last_name) {
        return user.last_name;
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

  if (user.type && user.type['@type'] === 'userTypeBot') {
    return 'bot';
  }

  if (!user.status) {
    return '';
  }

  switch (user.status['@type']) {
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
      const { was_online } = user.status;

      if (!was_online) return 'offline';

      const now = new Date();
      const wasOnline = new Date(was_online * 1000);

      if (wasOnline >= now) {
        return 'last seen just now';
      }

      const diff = new Date(now.getTime() - wasOnline.getTime());

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
      if (wasOnline > today) {
        // up to 6 hours ago
        if (diff.getTime() / 1000 < 6 * 60 * 60) {
          const hours = Math.floor(diff.getTime() / 1000 / 60 / 60);
          return `last seen ${hours === 1 ? '1 hour' : `${hours} hours`} ago`;
        }

        // other
        return `last seen today at ${formatTime(wasOnline)}`;
      }

      // yesterday
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      today.setHours(0, 0, 0, 0);
      if (wasOnline > yesterday) {
        return `last seen yesterday at ${formatTime(wasOnline)}`;
      }

      return `last seen ${formatFullDate(wasOnline)}`;
    }

    case 'userStatusOnline': {
      return 'online';
    }

    case 'userStatusRecently': {
      return 'last seen recently';
    }
  }

  return null;
}

export function isUserOnline(user: ApiUser) {
  const { id, status, type } = user;

  if (!status) {
    return false;
  }

  if (id === SERVICE_NOTIFICATIONS_USER_ID) {
    return false;
  }

  return status['@type'] === 'userStatusOnline' && type['@type'] !== 'userTypeBot';
}

export function getUserAvatarHash(user: ApiUser) {
  if (!user.avatar) {
    return undefined;
  }

  return `avatar${user.id}?${user.avatar.hash}`;
}

export function isDeletedUser(user: ApiUser) {
  if (!user.status || user.type['@type'] === 'userTypeBot') {
    return false;
  }

  return user.type['@type'] === 'userTypeDeleted'
    || user.type['@type'] === 'userTypeUnknown'
    || user.status['@type'] === 'userStatusEmpty';
}
