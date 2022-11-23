import {Authority} from '../enum/Authority';
import {AuthenticationType} from '../enum/AuthenticationType';

export interface IUserRequestPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  isActive: boolean;
  authorities: string;
}
export interface IUserUpdateRequestPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  authorities: number[];
  isActive: boolean;
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  isActive: boolean;
  authorities: IAuthority[];
  sourceSystem: ISourceSystem;
}

export interface IAPIKeyUser {
  id: number;
  fullName: string;
}

export interface IAuthority {
  id: number;
  type: Authority;
}

export interface ISourceSystem {
  id: string;
  type: AuthenticationType;
  uid: string;
}
