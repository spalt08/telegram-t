export default (collection: Record<string, any>[], orderKey: string, mode: 'asc' | 'desc' = 'asc') => {
  return collection.sort((a, b) => mode == 'asc' ? b[orderKey] - a[orderKey] : a[orderKey] - b[orderKey]);
};
