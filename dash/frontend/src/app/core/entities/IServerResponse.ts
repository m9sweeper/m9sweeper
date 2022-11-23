export interface IServerResponse<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
}
