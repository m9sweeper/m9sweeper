import {Authority} from '../../../../core/enum/Authority';

export class IMenuItem {
  name: string;
  path: string[];
  icon?: string;
  abbreviation?: {
    backgroundColor: string,
    letters: string,
  };
  image?: {
    src: string,
    alt: string,
    classes?: string
  };
  allowedRoles?: Authority[];
}
