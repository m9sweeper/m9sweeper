import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss']
})
export class SubNavigationComponent implements OnInit {
  @Input() buttonTitle: string;
  @Input() buttonUrl: any;
  @Input() title: string;
  @Input() clickFunction: any;
  constructor() {}

  ngOnInit(): void {
  }
}
