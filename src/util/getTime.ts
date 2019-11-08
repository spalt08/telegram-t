export default (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = padStart(String(date.getHours()), 2, '0');
  const minutes = padStart(String(date.getMinutes()), 2, '0');

  return `${hours}:${minutes}`;
}

function padStart(str: string, targetLength: number, padString: string) {
  while (str.length < targetLength) {
    str = padString + str;
  }

  return str;
}
