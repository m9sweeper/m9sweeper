import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubeBenchComponent } from './kube-bench.component';

describe('KubeBenchComponent', () => {
  let component: KubeBenchComponent;
  let fixture: ComponentFixture<KubeBenchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubeBenchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubeBenchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
