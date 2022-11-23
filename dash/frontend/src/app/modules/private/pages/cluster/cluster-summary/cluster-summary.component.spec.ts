import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterSummaryComponent } from './cluster-summary.component';

describe('ClusterSummaryComponent', () => {
  let component: ClusterSummaryComponent;
  let fixture: ComponentFixture<ClusterSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusterSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
