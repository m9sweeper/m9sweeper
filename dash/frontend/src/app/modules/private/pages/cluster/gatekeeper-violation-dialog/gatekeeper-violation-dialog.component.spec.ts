import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatekeeperViolationDialogComponent } from './gatekeeper-violation-dialog.component';

describe('GatekeeperViolationDialogComponent', () => {
  let component: GatekeeperViolationDialogComponent;
  let fixture: ComponentFixture<GatekeeperViolationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatekeeperViolationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatekeeperViolationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
