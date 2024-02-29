import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAuthConfigurationListComponent } from './external-auth-configuration-list.component';

describe('SingleSignOnConfigurationComponent', () => {
  let component: ExternalAuthConfigurationListComponent;
  let fixture: ComponentFixture<ExternalAuthConfigurationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalAuthConfigurationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalAuthConfigurationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
