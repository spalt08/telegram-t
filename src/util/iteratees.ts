type CollectionByKey<Member> = Record<number | string, Member>;

type OrderDirection = 'asc' | 'desc';

interface OrderCallback<T> {
  (member: T): any;
}

export function buildCollectionByKey<T extends AnyLiteral>(collection: T[], key: keyof T) {
  return collection.reduce((byKey: CollectionByKey<T>, member: T) => {
    byKey[member[key]] = member;

    return byKey;
  }, {});
}

export function mapValues<R extends any, M extends any>(
  byKey: CollectionByKey<M>,
  callback: (member: M, key: string, index: number, originalByKey: CollectionByKey<M>) => R,
): CollectionByKey<R> {
  return Object.keys(byKey).reduce((newByKey: CollectionByKey<R>, key, index) => {
    newByKey[key] = callback(byKey[key], key, index, byKey);
    return newByKey;
  }, {});
}

export function pick<T, K extends keyof T>(object: T, keys: K[]) {
  return keys.reduce((result, key) => {
    result[key] = object[key];
    return result;
  }, {} as Pick<T, K>);
}

export function orderBy<T>(
  collection: T[],
  orderKey: (keyof T) | OrderCallback<T> | ((keyof T) | OrderCallback<T>)[],
  mode: OrderDirection | [OrderDirection, OrderDirection] = 'asc',
): T[] {
  return collection.sort((a, b) => {
    if (Array.isArray(orderKey)) {
      const [mode1, mode2] = Array.isArray(mode) ? mode : [mode, mode];
      const [orderKey1, orderKey2] = orderKey;

      let aValue1;
      let bValue1;

      if (typeof orderKey1 === 'function') {
        aValue1 = orderKey1(a) || 0;
        bValue1 = orderKey1(b) || 0;
      } else if (typeof orderKey1 === 'string') {
        aValue1 = a[orderKey1] || 0;
        bValue1 = b[orderKey1] || 0;
      }

      if (aValue1 !== bValue1) {
        return mode1 === 'asc' ? aValue1 - bValue1 : bValue1 - aValue1;
      } else {
        let aValue2;
        let bValue2;

        if (typeof orderKey2 === 'function') {
          aValue2 = orderKey2(a) || 0;
          bValue2 = orderKey2(b) || 0;
        } else if (typeof orderKey2 === 'string') {
          aValue2 = a[orderKey2] || 0;
          bValue2 = b[orderKey2] || 0;
        }

        return mode2 === 'asc' ? aValue2 - bValue2 : bValue2 - aValue2;
      }
    }

    let aValue;
    let bValue;

    if (typeof orderKey === 'function') {
      aValue = orderKey(a) || 0;
      bValue = orderKey(b) || 0;
    } else if (typeof orderKey === 'string') {
      aValue = a[orderKey] || 0;
      bValue = b[orderKey] || 0;
    }

    return mode === 'asc' ? aValue - bValue : bValue - aValue;
  });
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

export function unique(array: any[]) {
  return Array.from(new Set(array));
}

export function areSortedArraysEqual(array1: any[], array2: any[]) {
  if (array1.length !== array2.length) {
    return false;
  }

  return array1.every((item, i) => item === array2[i]);
}

export function areSortedArraysIntersecting(array1: any[], array2: any[]) {
  return array1[0] <= array2[array2.length - 1] && array1[array1.length - 1] >= array2[0];
}
