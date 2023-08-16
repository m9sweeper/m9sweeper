import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditConstraintTemplateManifestComponent } from './add-edit-constraint-template-manifest.component';

describe('AddEditConstraintTemplateManifestComponent', () => {
  let component: AddEditConstraintTemplateManifestComponent;
  let fixture: ComponentFixture<AddEditConstraintTemplateManifestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditConstraintTemplateManifestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditConstraintTemplateManifestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
