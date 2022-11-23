import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubernetesImagesComponent } from './kubernetes-images.component';

describe('KubernetesImagesComponent', () => {
  let component: KubernetesImagesComponent;
  let fixture: ComponentFixture<KubernetesImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubernetesImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubernetesImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
