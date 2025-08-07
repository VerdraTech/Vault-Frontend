import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class ModalComponent  implements OnInit {
  private formBuilder = inject(FormBuilder);

  @Input() itemName!: string;
  @Input() itemPrice!: string;
  @Input() itemSize!: string;
  @Input() itemSku!: string;
  @Input() datePurchased!: string;
  @Input() dateSold!: string;
  @Input() itemLocation!: string;

  itemForm = this.formBuilder.group({
    name: [''],
    price: [''],
    size: [''],
    sku: [''],
    datePurchased: [''],
    dateSold: [''],
    location: ['']
  })

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.itemForm.patchValue({
      name: this.itemName,
      price: this.itemPrice,
      size: this.itemSize,
      sku: this.itemSku,
      datePurchased: this.datePurchased,
      dateSold: this.dateSold,
      location: this.itemLocation
    })
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel')
  }

  confirm() {
    return this.modalController.dismiss(this.itemForm.getRawValue(), 'confirm')
  }

}
