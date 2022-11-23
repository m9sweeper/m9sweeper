import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAuthCbComponent } from './external-auth-cb.component';

describe('ExternalAuthCbComponent', () => {
  let component: ExternalAuthCbComponent;
  let fixture: ComponentFixture<ExternalAuthCbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalAuthCbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalAuthCbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
