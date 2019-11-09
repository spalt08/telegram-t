export default <T>(object: Record<string, T>): T[] => {
  return Object.keys(object).map((key) => object[key]);
};
