import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerListComponent } from './scanner-list.component';

describe('ScannerListComponent', () => {
  let component: ScannerListComponent;
  let fixture: ComponentFixture<ScannerListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScannerListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
