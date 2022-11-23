import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubernetesNamespacesComponent } from './kubernetes-namespaces.component';

describe('KubernetesNamespacesComponent', () => {
  let component: KubernetesNamespacesComponent;
  let fixture: ComponentFixture<KubernetesNamespacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubernetesNamespacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubernetesNamespacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
