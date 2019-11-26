export default function searchWords(haystack: string, needle: string) {
  if (!haystack || !needle) {
    return false;
  }

  const haystackWords = haystack.toLowerCase().split(/[\s,]+/);
  const needleWords = needle.toLowerCase().split(/[\s,]+/);
  const isMatching = needleWords.every((needleWord) => (
    haystackWords.some((haystackWord) => haystackWord.startsWith(needleWord))
  ));

  return isMatching;
}
