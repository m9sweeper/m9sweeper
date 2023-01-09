import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../../../../core/services/falco.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-falco-settings',
  templateUrl: './falco-settings.component.html',
  styleUrls: ['./falco-settings.component.scss']
})
export class FalcoSettingsComponent implements OnInit {

  priorityLevels: string [] = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];
  filterForm: FormGroup;
  isChecked = false;
  weekDays: string [] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private route: ActivatedRoute,
    private falcoService: FalcoService,
    private formBuilder: FormBuilder,

  ) { }

  ngOnInit(): void {

    this.filterForm = this.formBuilder.group({
      selectedPriorityLevels: [[]],
      notifyAnomolies: [],
      dayInput: [],
    });

  }

  onClickSave(){

  }
  onClickEdit(){

  }
  onClickDelete(){

  }
  onCickAddRule(){

  }


}
