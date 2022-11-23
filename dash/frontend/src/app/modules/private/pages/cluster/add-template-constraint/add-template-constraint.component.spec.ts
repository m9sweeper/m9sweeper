import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTemplateConstraintComponent } from './add-template-constraint.component';

describe('AddTemplateConstraintComponent', () => {
  let component: AddTemplateConstraintComponent;
  let fixture: ComponentFixture<AddTemplateConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTemplateConstraintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTemplateConstraintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
