import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericErrorDialogComponent } from './generic-error-dialog.component';

describe('GenericErrorDialogComponent', () => {
  let component: GenericErrorDialogComponent;
  let fixture: ComponentFixture<GenericErrorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericErrorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
