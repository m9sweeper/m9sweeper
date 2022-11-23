import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAuthConfigurationCreateComponent } from './external-auth-configuration-create.component';

describe('ExternalAuthConfigurationCreateComponent', () => {
  let component: ExternalAuthConfigurationCreateComponent;
  let fixture: ComponentFixture<ExternalAuthConfigurationCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalAuthConfigurationCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalAuthConfigurationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
