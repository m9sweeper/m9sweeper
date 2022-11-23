import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerCreateComponent } from './scanner-create.component';

describe('ScannerCreateComponent', () => {
  let component: ScannerCreateComponent;
  let fixture: ComponentFixture<ScannerCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScannerCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
