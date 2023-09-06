import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SimpleMessageDialogComponent} from '../../modules/shared/simple-message-dialog/simple-message-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(protected readonly dialog: MatDialog) {

  }
  getImageName(imageWithDomainAndRepository: string): string {
    const group = imageWithDomainAndRepository.split('/');
    return group[group.length - 1];
  }

  getImageNameWithRepository(imageWithDomainAndRepository: string): string {
    const regex = /([a-zA-Z0-9]+\.[a-zA-Z0-9\.]+\/)/g;
    const group = imageWithDomainAndRepository.split(regex);
    return group[group.length - 1];
  }

  showGenericMessageDialog(title: string, message: string) {
    this.dialog.open(SimpleMessageDialogComponent, {
      width: '60%',
      maxWidth: '800px',
      data: { title, message }
    });
  }
}
