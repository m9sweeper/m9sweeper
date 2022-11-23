import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowJsonDataComponent } from './show-json-data.component';

describe('ShowJsonDataComponent', () => {
  let component: ShowJsonDataComponent;
  let fixture: ComponentFixture<ShowJsonDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowJsonDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowJsonDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
