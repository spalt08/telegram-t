export function formatTime(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const hours = padStart(String(date.getHours()), 2, '0');
  const minutes = padStart(String(date.getMinutes()), 2, '0');

  return `${hours}:${minutes}`;
}

export function formatDate(datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const day = padStart(String(date.getDate()), 2, '0');
  const month = padStart(String(date.getMonth()), 2, '0');
  const year = date.getFullYear();

  return `${day}:${month}:${year}`;
}

function padStart(str: string, targetLength: number, padString: string) {
  while (str.length < targetLength) {
    str = padString + str;
  }

  return str;
}
