import {NavServiceInterface} from './nav-service.interface';
import {IMenuItem} from '../../../shared/side-nav/interfaces/menu-item.interface';
import {IMenuContentTrigger} from '../../../shared/side-nav/interfaces/menu-content-trigger.interface';
import {Injectable, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ClusterGroupService} from '../../../../core/services/cluster-group.service';
import {BehaviorSubject} from 'rxjs';
import {
  ClusterGroupCreateComponent
} from '../../pages/cluster-group/cluster-group-create/cluster-group-create.component';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClusterListMenuService implements NavServiceInterface, OnDestroy {
  menuItems: IMenuItem[];
  menuContentTriggers: IMenuContentTrigger[];
  abbreviationBackgroundColors = ['#004C1A', '#AA0000', '#2F6C71', '#B600A0', '#008272', '#001E51', '#004B51'];

  public associatedRegexPaths = [
    new RegExp('^(/private/dashboard)(.*)'),
  ];
  public currentMenuItems = new BehaviorSubject<IMenuItem[]>([]);
  public currentMenuContentTriggers = new BehaviorSubject<IMenuContentTrigger[]>([]);
  public showOrgSettingsButton = true;
  public showReturnHomeButton = false;

  constructor(
    private clusterGroupService: ClusterGroupService,
    private dialog: MatDialog,
  ) {
    this.buildClusterMenu();
    this.buildClusterListTriggers();
  }

  ngOnDestroy() {
    this.currentMenuItems.complete();
    this.currentMenuContentTriggers.complete();
  }

  buildClusterMenu() {
    this.clusterGroupService.getClusterGroups()
      .pipe(take(1))
      .subscribe({
        next: (groups) => {
          if (groups.data) {
            this.menuItems = [];
            groups.data.forEach((group, index): IMenuItem => {
              if (!group) { return; }
              const name = group.name;
              const path = ['/private', 'dashboard', 'group', group?.id];
              const abbreviation = {
                backgroundColor: this.calculateMenuColor(index),
                letters: this.buildAbbreviation(group.name),
              };
              this.menuItems.push({ name, path, abbreviation });
            });
            this.currentMenuItems.next(this.menuItems);
          } else {
            this.menuItems = [];
            this.currentMenuItems.next([]);
          }
        }
      });
  }
  calculateMenuColor(rowIndex: number ) {
    if (rowIndex < 5) {
      return this.abbreviationBackgroundColors[rowIndex];
    }
    return this.abbreviationBackgroundColors[rowIndex % 7];
  }
  buildAbbreviation(name: string){
    const trimmedName = name.trim();
    if (trimmedName.length > 1 ) {
      const splitNameArray = trimmedName.split(' ').filter(value => value);
      return splitNameArray.length > 1 ? splitNameArray[0][0] + splitNameArray[1][0] : splitNameArray[0].substr(0, 2);
    }
    return trimmedName;
  }

  buildClusterListTriggers() {
    this.menuContentTriggers = [{
      name: 'add-cluster-group',
      title: 'Add Cluster Group',
      icon: 'add',
      adminsOnly: true,
      callback: this.openAddGroupDialog,
    }];
    this.currentMenuContentTriggers.next(this.menuContentTriggers);
  }

  openAddGroupDialog(parent: ClusterListMenuService) {
    const confirmDialog = parent.dialog.open(ClusterGroupCreateComponent, {
      width: '520px',
      closeOnNavigation: true,
      disableClose: true,
      data: {}
    });
    confirmDialog.afterClosed().pipe(take(1)).subscribe(result => {
      if (result === true) {
        parent.buildClusterMenu();
      }
    });
  }
}
