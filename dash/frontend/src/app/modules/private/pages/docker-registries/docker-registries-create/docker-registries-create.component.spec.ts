import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DockerRegistriesCreateComponent } from './docker-registries-create.component';

describe('DockerRegistriesCreateComponent', () => {
  let component: DockerRegistriesCreateComponent;
  let fixture: ComponentFixture<DockerRegistriesCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DockerRegistriesCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DockerRegistriesCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
