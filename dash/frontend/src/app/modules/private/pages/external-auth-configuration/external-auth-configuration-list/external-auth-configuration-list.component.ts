import {Component, OnInit} from '@angular/core';
import {ExternalAuthConfigurationService} from '../../../../../core/services/external-auth-configuration.service';
import {MatDialog} from '@angular/material/dialog';
import {ExternalAuthConfigurationCreateComponent} from '../external-auth-configuration-create/external-auth-configuration-create.component';
import {MatTableDataSource} from '@angular/material/table';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {IAuthConfig} from '../../../../../core/entities/IAuth';
import {AuthenticationType} from '../../../../../core/enum/AuthenticationType';
import {take} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'app-external-auth-configuration-list',
  templateUrl: './external-auth-configuration-list.component.html',
  styleUrls: ['./external-auth-configuration-list.component.scss']
})
export class ExternalAuthConfigurationListComponent implements OnInit {
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;
  subMenuTitle: 'External Configuration List';
  displayedColumns: string[] = ['id', 'authName', 'authType', 'authProvider', 'isActive', 'actions'];
  dataSource: MatTableDataSource<IAuthConfig>;
  externalAuthConfig: IAuthConfig;

  authenticationType: typeof AuthenticationType = AuthenticationType;

  constructor(private externalAuthConfigurationService: ExternalAuthConfigurationService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getExternalAuthConfigs();
    this.subNavigationTitle = 'External Auth Configuration';
    this.subNavigationButtonTitle = 'Add External Auth Configuration';
    this.subNavigationButtonUrl = '';
  }

  getExternalAuthConfigs(){
    this.externalAuthConfigurationService.loadProviderList().pipe(take(1))
      .subscribe((response: IServerResponse<IAuthConfig[]>) => {
        this.dataSource = new MatTableDataSource<IAuthConfig>(response.data);
      }, error => {
        if (!environment.production) {
          console.log('External Auth Provider list load error: ', error);
        }
      });
  }

  openAddExternalAuthConfigurationDialog(authConfig?: IAuthConfig) {
    if (authConfig && authConfig.authType === AuthenticationType.LOCAL) {
      return;
    }
    const confirmDialog = this.dialog.open( ExternalAuthConfigurationCreateComponent, {
      width: '600px',
      height: 'auto',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        isEdit: authConfig ? true : false,
        authConfigData: authConfig ? authConfig : null
      }
    });
    confirmDialog.afterClosed().subscribe(result => {
      if (result === undefined) {
        this.getExternalAuthConfigs();
      }
    });
  }

}
