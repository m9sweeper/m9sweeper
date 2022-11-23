import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubernetesDeploymentsComponent } from './kubernetes-deployments.component';

describe('KubernetesDeploymentsComponent', () => {
  let component: KubernetesDeploymentsComponent;
  let fixture: ComponentFixture<KubernetesDeploymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubernetesDeploymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubernetesDeploymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
