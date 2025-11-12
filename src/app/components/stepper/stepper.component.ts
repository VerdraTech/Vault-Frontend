import { Component, input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  imports: [IonicModule]
})
export class StepperComponent implements OnInit {
  status = input.required<string>()
  currentStep = 0;
  statusLabel = ''

  steps = [
    'Pre-Transit', 
    'Transit', 
    'Delivered',
  ];

  private statusMap: Record<string, number> = {
    PRE_TRANSIT: 0,
    TRANSIT: 1,
    DELIVERED: 2,
  };

  private statusLabelMap: Record<string, string> = {
    PRE_TRANSIT: 'Pre-Transit',
    TRANSIT: 'In Transit',
    DELIVERED: 'Delivered',
  };

  constructor() { }

  ngOnInit() {
    this.currentStep = this.statusMap[this.status()]
    this.statusLabel = this.statusLabelMap[this.status()]
  }

}
