type Member = { id: number };
type CollectionById<Member> = Record<number, Member>;

export function buildCollectionById<T extends Member>(collection: T[]) {
  return collection.reduce((byId: CollectionById<T>, member: T) => {
    byId[member.id] = member;

    return byId;
  }, {});
}

export function orderBy<T = AnyLiteral>(
  collection: T[],
  orderKey: string | ((member: T) => any),
  mode: 'asc' | 'desc' = 'asc',
): T[] {
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
}

export function toArray<T>(object: Record<string, T>): T[] {
  return Object.keys(object).map((key) => object[key]);
}

export function flatten(array: any[]) {
  return array.reduce((result, member) => {
    if (Array.isArray(member)) {
      return [
        ...result,
        ...member,
      ];
    } else {
      result.push(member);
      return result;
    }
  }, []);
}
