import { Component, OnInit } from '@angular/core';
import {AuditLogService} from '../../../../../core/services/audit-log.service';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {IAuditLog} from '../../../../../core/entities/IAuditLog';
import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {ShowJsonDataComponent} from '../../../../../core/dialogues/show-json-data/show-json-data.component';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {CsvService} from '../../../../../core/services/csv.service';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {
  subNavigationTitle: string;
  displayedColumns: string[] = ['id', 'entity_type', 'entity_id', 'event_type', 'event_time', 'user', 'data'];
  dataSource: MatTableDataSource<IAuditLog>;
  dialogRef: MatDialogRef<ShowJsonDataComponent>;
  filterAuditLogForm: UntypedFormGroup;
  entityTypes: { entityType: string }[];
  totalAuditLogs = 0;
  showAuditLogTable = false;

  constructor(private auditLogService: AuditLogService,
              private formBuilder: UntypedFormBuilder,
              private dialog: MatDialog,
              private loaderService: NgxUiLoaderService,
              private csvService: CsvService) {
    this.filterAuditLogForm = this.formBuilder.group({
      entityId: [],
      entityTypes: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.subNavigationTitle = 'Audit Logs';
    this.dataSource =  null;
    // this.loadAuditLogs();
    this.getEntityTypes();
  }

  showMetaDataDetails(auditLog: IAuditLog) {
    this.dialogRef = this.dialog.open(ShowJsonDataComponent, {
      width: 'auto',
      data: {content: auditLog.data, header: 'MetaData'}
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });  }

  filterAuditLogs() {
    const entityType = this.filterAuditLogForm.value.entityTypes;
    const entityId = this.filterAuditLogForm.value.entityId;
    this.auditLogService.filterAuditLogs(entityType, entityId).subscribe(response => {
      this.showAuditLogTable = true;
      this.totalAuditLogs = response.data.length;
      this.dataSource = new MatTableDataSource(response.data);
    });
  }

  getEntityTypes() {
    this.auditLogService.getEntityTypes().subscribe(response => {
      this.entityTypes = response.data;
    });
  }

  loadAuditLogs() {
    this.auditLogService.getAuditLogs().subscribe(response => {
      this.totalAuditLogs = response.data.length;
      this.dataSource = new MatTableDataSource(response.data);
    });
  }

  resetAuditLogs() {
    // this.loadAuditLogs();
    this.showAuditLogTable = false;
  }

  downloadAuditLogs() {
    const entityType = this.filterAuditLogForm.value.entityTypes;
    const entityId = this.filterAuditLogForm.value.entityId;
    this.loaderService.start('audit-logs-download');
    this.auditLogService.downloadAuditLogs(entityType, entityId).subscribe(response => {
      this.csvService.downloadCsvFile(response.data.content, response.data.filename);
    }, (error) => {
      this.loaderService.stop('audit-logs-download');
      alert(`Error downloading audit logs: ${error?.error?.message}`);
    }, () => {
      this.loaderService.stop('audit-logs-download');
    });
  }
}
