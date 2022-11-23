import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmScanAllDialogComponent } from './confirm-scan-all-dialog.component';

describe('ConfirmScanAllDialogComponent', () => {
  let component: ConfirmScanAllDialogComponent;
  let fixture: ComponentFixture<ConfirmScanAllDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmScanAllDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmScanAllDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
