import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConstraintCriteriaComponent } from './add-constraint-criteria.component';

describe('AddConstraintCriteriaComponent', () => {
  let component: AddConstraintCriteriaComponent;
  let fixture: ComponentFixture<AddConstraintCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddConstraintCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConstraintCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
