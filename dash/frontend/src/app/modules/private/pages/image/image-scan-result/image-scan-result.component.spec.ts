import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageScanResultComponent } from './image-scan-result.component';

describe('ImageScanResultComponent', () => {
  let component: ImageScanResultComponent;
  let fixture: ComponentFixture<ImageScanResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageScanResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageScanResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
