import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionCreateComponent } from './exception-create.component';

describe('ExceptionCreateComponent', () => {
  let component: ExceptionCreateComponent;
  let fixture: ComponentFixture<ExceptionCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExceptionCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
