export interface IComment {
  id?: number;
  content: string;
  user?: string;
  userId?: number;
  exceptionId?: number;
  createdAt?: string;
  canDeleteThisComment?: boolean;
}
