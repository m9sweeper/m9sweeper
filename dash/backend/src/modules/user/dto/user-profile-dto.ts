import {Exclude, Expose, Transform, Type} from 'class-transformer';

export class UserAuthority {
  id: number;
  @Expose({name: 'name', toPlainOnly: true})
  type?: string;
}

export class SourceSystem {
  id: string;
  type: string;
  uid: string;
}

export class UserProfileDto {

  id: number;

  @Expose({name: 'first_name', toPlainOnly: true})
  firstName: string;

  @Expose({name: 'last_name', toPlainOnly: true})
  lastName: string;

  @Expose({name: 'email', toPlainOnly: true})
  email: string;

  @Expose({name: 'phone', toPlainOnly: true})
  phone: string;

  password: string;

  @Expose({name: 'is_active', toPlainOnly: true})
  isActive: boolean;

  createdAt: number;

  updatedAt: number;

  deletedAt: number;

  @Type(() => UserAuthority)
  authorities: UserAuthority[];

  @Exclude({toPlainOnly: true})
  @Type(() => SourceSystem)
  sourceSystem: SourceSystem;

  @Expose({name: 'source_system_id', toPlainOnly: true})
  get sourceSystemId(): string {
    return this.sourceSystem?.id;
  }

  @Expose({name: 'source_system_type', toPlainOnly: true})
  get sourceSystemType(): string {
    return this.sourceSystem?.type;
  }

  @Expose({name: 'source_system_user_id', toPlainOnly: true})
  get sourceSystemUserId(): string {
    return this.sourceSystem?.uid;
  }
}

export class UserListDto {
  id: number;
  @Expose({name: 'full_name', toPlainOnly: true})
  fullName: string;
}
