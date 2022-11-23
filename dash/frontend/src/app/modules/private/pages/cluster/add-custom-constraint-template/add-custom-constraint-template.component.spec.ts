import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomConstraintTemplateComponent } from './add-custom-constraint-template.component';

describe('AddCustomConstraintTemplateComponent', () => {
  let component: AddCustomConstraintTemplateComponent;
  let fixture: ComponentFixture<AddCustomConstraintTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCustomConstraintTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomConstraintTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
