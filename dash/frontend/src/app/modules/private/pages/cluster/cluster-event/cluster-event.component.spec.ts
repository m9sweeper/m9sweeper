import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterEventComponent } from './cluster-event.component';

describe('ClusterEventComponent', () => {
  let component: ClusterEventComponent;
  let fixture: ComponentFixture<ClusterEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusterEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
