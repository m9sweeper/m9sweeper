import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterInfoComponent } from './cluster-info.component';

describe('ClusterInfoComponent', () => {
  let component: ClusterInfoComponent;
  let fixture: ComponentFixture<ClusterInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusterInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
