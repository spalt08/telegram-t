type Member = { id: number };
type CollectionById<Member> = Record<number, Member>;

export default <T extends Member>(collection: T[]) => {
  return collection.reduce((byId: CollectionById<T>, member: T) => {
    byId[member.id] = member;

    return byId;
  }, {});
}
