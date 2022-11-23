import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GateKeeperDetailsComponent } from './gate-keeper-details.component';

describe('GateKeeperDetailsComponent', () => {
  let component: GateKeeperDetailsComponent;
  let fixture: ComponentFixture<GateKeeperDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GateKeeperDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GateKeeperDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
