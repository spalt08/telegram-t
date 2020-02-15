export function formatInteger(value: number) {
  return String(value).replace(/\d(?=(\d{3})+$)/g, '$&,');
}

function formatFixedNumber(number: number) {
  const fixed = String(number.toFixed(1));
  if (fixed.substr(-2) === '.0') {
    return number.toFixed(0);
  }

  return number.toFixed(1);
}

export function formatIntegerCompact(views: number) {
  if (views < 10000) {
    return views;
  }
  const thousands = views / 1000;
  if (thousands < 1000) {
    return `${formatFixedNumber(thousands)}K`;
  }

  const millions = views / 1000000;
  return `${formatFixedNumber(millions)}M`;
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
