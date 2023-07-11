import {IMenuContentTrigger} from '../../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {IMenuItem} from '../../../shared/side-nav/interfaces/menu-item.interface';
import {BehaviorSubject} from 'rxjs';

export interface NavServiceInterface {
  menuItems: IMenuItem[];
  menuContentTriggers: IMenuContentTrigger[];
  associatedRegexPaths: RegExp[];
  currentMenuItems: BehaviorSubject<IMenuItem[]>;
  currentMenuContentTriggers: BehaviorSubject<IMenuContentTrigger[]>;
}
