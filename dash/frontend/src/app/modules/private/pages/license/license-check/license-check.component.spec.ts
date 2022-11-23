import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseCheckComponent } from './license-check.component';

describe('LicenseCheckComponent', () => {
  let component: LicenseCheckComponent;
  let fixture: ComponentFixture<LicenseCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
