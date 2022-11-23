import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchDialogComponent } from './advanced-search-dialog.component';

describe('AdvancedSearchDialogComponent', () => {
  let component: AdvancedSearchDialogComponent;
  let fixture: ComponentFixture<AdvancedSearchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedSearchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
