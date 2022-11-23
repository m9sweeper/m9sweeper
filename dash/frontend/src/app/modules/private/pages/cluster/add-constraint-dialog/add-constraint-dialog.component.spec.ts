import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConstraintDialogComponent } from './add-constraint-dialog.component';

describe('AddConstraintDialogComponent', () => {
  let component: AddConstraintDialogComponent;
  let fixture: ComponentFixture<AddConstraintDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddConstraintDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConstraintDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
