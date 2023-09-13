export enum Authority {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    READ_ONLY = 'READ_ONLY'
}

export enum AuthorityId {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  READ_ONLY = 3
}
export const AuthorityValues = [
  Authority.SUPER_ADMIN,
  Authority.ADMIN,
  Authority.READ_ONLY,
];
