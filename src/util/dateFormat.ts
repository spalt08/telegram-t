const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatTime(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const hours = padStart(String(date.getHours()), 2, '0');
  const minutes = padStart(String(date.getMinutes()), 2, '0');

  return `${hours}:${minutes}`;
}

export function formatDate(datetime: number | Date, isShort = false) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const day = date.getDate();
  const month = padStart(String(date.getMonth() + 1), 2, '0');
  const year = String(date.getFullYear()).slice(0, isShort ? 2 : 4);

  return `${day}.${month}.${year}`;
}

export function formatDateForMessageList(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const currentYear = new Date().getFullYear();
  const year = date.getFullYear();

  return `${month} ${day}${year < currentYear ? ` ${year}` : ''}`;
}

function padStart(str: string, targetLength: number, padString: string) {
  while (str.length < targetLength) {
    str = padString + str;
  }

  return str;
}

export function formatPastTimeShort(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    return formatTime(date);
  }

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  today.setHours(0, 0, 0, 0);
  if (date > weekAgo) {
    return WEEKDAYS_SHORT[date.getDay()];
  }

  return formatDate(date, true);
}

export function formatChatDateHeader(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    return 'Today';
  }

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(today.getHours());
  if (date > yesterday) {
    return 'Yesterday';
  }

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  today.setHours(0, 0, 0, 0);
  if (date > weekAgo) {
    return WEEKDAYS_FULL[date.getDay()];
  }

  return formatDateForMessageList(date);
}

export function formatPastTime(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const now = new Date();

  if (date >= now) {
    return 'just now';
  }

  const diff = new Date(now.getTime() - date.getTime());

  // within a minute
  if (diff.getTime() / 1000 < 60) {
    return 'just now';
  }

  // within an hour
  if (diff.getTime() / 1000 < 60 * 60) {
    const minutes = Math.floor(diff.getTime() / 1000 / 60);
    return `${minutes === 1 ? '1 minute' : `${minutes} minutes`} ago`;
  }

  // today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    // up to 6 hours ago
    if (diff.getTime() / 1000 < 6 * 60 * 60) {
      const hours = Math.floor(diff.getTime() / 1000 / 60 / 60);
      return `${hours === 1 ? '1 hour' : `${hours} hours`} ago`;
    }

    // other
    return `today at ${formatTime(date)}`;
  }

  // yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  if (date > yesterday) {
    return `yesterday at ${formatTime(date)}`;
  }

  return `${formatDate(date)}`;
}

export function isSameDay(datetime1: number | Date, datetime2: number | Date) {
  const date1 = typeof datetime1 === 'number' ? new Date(datetime1) : datetime1;
  const date2 = typeof datetime2 === 'number' ? new Date(datetime2) : datetime2;

  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  return date1.valueOf() === date2.valueOf();
}
