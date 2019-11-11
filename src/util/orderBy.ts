export default <T = AnyLiteral>(
  collection: T[],
  orderKey: string | ((member: T) => any),
  mode: 'asc' | 'desc' = 'asc',
): T[] => {
  return collection.sort((a, b) => {
    let aValue;
    let bValue;

    if (typeof orderKey === 'function') {
      aValue = orderKey(a);
      bValue = orderKey(b);
    } else {
      // @typing-hack.
      aValue = (a as AnyLiteral)[orderKey];
      bValue = (b as AnyLiteral)[orderKey];
    }

    return mode === 'asc' ? bValue - aValue : aValue - bValue;
  });
};
