import { Exclude } from 'class-transformer';
import { V1APIService } from '@kubernetes/client-node';

@Exclude()
export class GatekeeperDto extends V1APIService {}
