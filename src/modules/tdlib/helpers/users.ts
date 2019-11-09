import { ApiUser } from '../types/users';

export function getUserFullName(user: ApiUser) {
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
    }
    case 'userTypeDeleted':
    case 'userTypeUnknown': {
      return 'Deleted account';
    }
  }
}
