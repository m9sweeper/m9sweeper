import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterGroupCreateComponent } from './cluster-group-create.component';

describe('ClusterGroupCreateComponent', () => {
  let component: ClusterGroupCreateComponent;
  let fixture: ComponentFixture<ClusterGroupCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusterGroupCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterGroupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
