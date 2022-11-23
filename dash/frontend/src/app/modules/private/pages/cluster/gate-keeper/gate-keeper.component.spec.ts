import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GateKeeperComponent } from './gate-keeper.component';

describe('GateKeeperComponent', () => {
  let component: GateKeeperComponent;
  let fixture: ComponentFixture<GateKeeperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GateKeeperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GateKeeperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
