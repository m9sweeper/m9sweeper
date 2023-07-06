import {IMenuContentTrigger} from '../../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {IMenuItem} from '../../../shared/side-nav/interfaces/menu-item.interface';
import {ClusterGroupService} from '../../../../core/services/cluster-group.service';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';

export interface NavServiceInterface {
  menuItems: IMenuItem[];
  menuContentTriggers: IMenuContentTrigger[];
  associatedRegexPaths: RegExp[];
  currentMenuItems: BehaviorSubject<IMenuItem[]>;
  currentMenuContentTriggers: BehaviorSubject<IMenuContentTrigger[]>;
}
