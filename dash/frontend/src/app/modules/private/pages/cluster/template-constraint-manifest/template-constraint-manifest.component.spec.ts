import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateConstraintManifestComponent } from './template-constraint-manifest.component';

describe('TemplateConstraintManifestComponent', () => {
  let component: TemplateConstraintManifestComponent;
  let fixture: ComponentFixture<TemplateConstraintManifestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateConstraintManifestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateConstraintManifestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
