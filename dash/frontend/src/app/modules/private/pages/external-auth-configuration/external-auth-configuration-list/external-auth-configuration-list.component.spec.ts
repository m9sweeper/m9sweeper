import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSignOnConfigurationComponent } from './single-sign-on-configuration.component';

describe('SingleSignOnConfigurationComponent', () => {
  let component: SingleSignOnConfigurationComponent;
  let fixture: ComponentFixture<SingleSignOnConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleSignOnConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleSignOnConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
