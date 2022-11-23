import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DockerRegistriesListComponent } from './docker-registries-list.component';

describe('DockerRegistriesListComponent', () => {
  let component: DockerRegistriesListComponent;
  let fixture: ComponentFixture<DockerRegistriesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DockerRegistriesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DockerRegistriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
