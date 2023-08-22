import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

@Exclude()
export class GatekeeperResponseStructure<T> {
  @Expose()
  status: boolean;

  @Expose()
  message: string;

  @IsOptional()
  @Expose()
  error?: any;

  @IsOptional()
  @Expose()
  data?: T;

  constructor(responseInfo: {status: boolean, message: string, error?: any, data?: T}) {
    this.status = responseInfo.status;
    this.message = responseInfo.message;
    this.error = responseInfo.error;
    this.data = responseInfo.data;
  }
}
