import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalcoJsonDataDialogComponent } from './falco-json-data-dialog.component';

describe('FalcoJsonDataDialogComponent', () => {
  let component: FalcoJsonDataDialogComponent;
  let fixture: ComponentFixture<FalcoJsonDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FalcoJsonDataDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalcoJsonDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
