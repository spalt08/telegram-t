export function formatInteger(value: number) {
  return String(value).replace(/\d(?=(\d{3})+$)/g, '$& ');
}

function formatFixedNumber(number: number) {
  const fixed = String(number.toFixed(1));
  if (fixed.substr(-2) === '.0') {
    return Math.round(number);
  }

  return number.toFixed(1).replace('.', ',');
}

export function formatIntegerCompact(views: number) {
  if (views < 1e3) {
    return views;
  }

  if (views < 1e6) {
    return `${formatFixedNumber(views / 1e3)}K`;
  }

  return `${formatFixedNumber(views / 1e6)}M`;
}

export function getFirstLetters(phrase: string) {
  return phrase
    .replace(/[^\wа-яё\s]+/gi, '')
    .trim()
    .split(/\s+/)
    .map((word: string) => word.length && word[0])
    .join('')
    .toUpperCase();
}
