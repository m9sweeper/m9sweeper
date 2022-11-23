import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageScanResultScannerDetailsComponent } from './image-scan-result-scanner-deatils.component';

describe('ImageScanResultScannerDeatilsComponent', () => {
  let component: ImageScanResultScannerDetailsComponent;
  let fixture: ComponentFixture<ImageScanResultScannerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageScanResultScannerDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageScanResultScannerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
