import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss']
})
export class SubNavigationComponent implements OnInit {
  @Input() buttonTitle: string;
  @Input() buttonUrl: any;
  @Input() title: string;
  constructor() {}

  ngOnInit(): void {
  }
}
