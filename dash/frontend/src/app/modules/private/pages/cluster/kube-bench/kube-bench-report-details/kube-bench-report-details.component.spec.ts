import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubeBenchReportDetailsComponent } from './kube-bench-report-details.component';

describe('KubeBenchReportDetailsComponent', () => {
  let component: KubeBenchReportDetailsComponent;
  let fixture: ComponentFixture<KubeBenchReportDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubeBenchReportDetailsComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubeBenchReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
