const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function getDayStart(datetime: number | Date) {
  const date = new Date(datetime);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatPastTimeShort(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const today = getDayStart(new Date());
  if (date >= today) {
    return formatTime(date);
  }

  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  if (date >= weekAgo) {
    return WEEKDAYS_SHORT[date.getDay()];
  }

  return formatFullDate(date, true);
}

export function formatTime(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const hours = padStart(String(date.getHours()), 2, '0');
  const minutes = padStart(String(date.getMinutes()), 2, '0');

  return `${hours}:${minutes}`;
}

export function formatFullDate(datetime: number | Date, isShort = false) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const day = date.getDate();
  const month = padStart(String(date.getMonth() + 1), 2, '0');
  const year = String(date.getFullYear()).slice(isShort ? -2 : -4);

  return `${day}.${month}.${year}`;
}

export function formatHumanDate(datetime: number | Date, isShort = false) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const today = getDayStart(new Date());
  if (date >= today) {
    return 'Today';
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date >= yesterday) {
    return 'Yesterday';
  }

  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  if (date >= weekAgo) {
    return WEEKDAYS_FULL[date.getDay()];
  }

  const day = date.getDate();
  const monthsArray = isShort ? MONTHS_SHORT : MONTHS_FULL;
  const month = monthsArray[date.getMonth()];
  const currentYear = today.getFullYear();
  const year = date.getFullYear();

  return `${month} ${day}${year < currentYear ? ` ${year}` : ''}`;
}

function padStart(str: string, targetLength: number, padString: string) {
  while (str.length < targetLength) {
    str = padString + str;
  }

  return str;
}

export function formatMediaDateTime(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  return `${formatHumanDate(date, true)} at ${formatTime(date)}`;
}

export function formatMediaDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 3600 % 60);

  let string = '';
  if (hours > 0) {
    string += `${padStart(String(hours), 2, '0')}:`;
    string += `${padStart(String(minutes), 2, '0')}:`;
  } else {
    string += `${String(minutes)}:`;
  }
  string += padStart(String(seconds), 2, '0');

  return string;
}

export function formatVoiceRecordDuration(durationInMs: number) {
  const parts = [];

  let milliseconds = durationInMs % 1000;
  durationInMs -= milliseconds;
  milliseconds = Math.floor(milliseconds / 10);

  durationInMs = Math.floor(durationInMs / 1000);
  const seconds = durationInMs % 60;
  durationInMs -= seconds;

  durationInMs = Math.floor(durationInMs / 60);
  const minutes = durationInMs % 60;
  durationInMs -= minutes;

  durationInMs = Math.floor(durationInMs / 60);
  const hours = durationInMs % 60;

  if (hours > 0) {
    parts.push(padStart(String(hours), 2, '0'));
  }
  parts.push(padStart(String(minutes), hours > 0 ? 2 : 1, '0'));
  parts.push(padStart(String(seconds), 2, '0'));

  return `${parts.join(':')},${padStart(String(milliseconds), 2, '0')}`;
}
