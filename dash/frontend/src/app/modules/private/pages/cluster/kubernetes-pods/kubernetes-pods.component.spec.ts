import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubernetesPodsComponent } from './kubernetes-pods.component';

describe('KubernetesPodsComponent', () => {
  let component: KubernetesPodsComponent;
  let fixture: ComponentFixture<KubernetesPodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubernetesPodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubernetesPodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
