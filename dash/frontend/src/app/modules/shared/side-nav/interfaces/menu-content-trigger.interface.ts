import {Authority} from '../../../../core/enum/Authority';

export class IMenuContentTrigger {
  name: string;
  title: string;
  icon: string;
  allowedRoles: Authority[];
  callback: (parent) => void;
}
