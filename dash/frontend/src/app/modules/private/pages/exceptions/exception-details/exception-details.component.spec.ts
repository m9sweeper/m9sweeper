import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionDetailsComponent } from './exception-details.component';

describe('ExceptionDetailsComponent', () => {
  let component: ExceptionDetailsComponent;
  let fixture: ComponentFixture<ExceptionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExceptionDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
