import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClusterWizardComponent} from './add-cluster-wizard.component';

describe('AddClusterWidzardComponent', () => {
  let component: AddClusterWizardComponent;
  let fixture: ComponentFixture<AddClusterWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddClusterWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClusterWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
