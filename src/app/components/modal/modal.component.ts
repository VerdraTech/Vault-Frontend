import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { Item } from 'src/app/model/item';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class ModalComponent  implements OnInit {
  private formBuilder = inject(FormBuilder);

  @Input() action!: string;
  @Input() itemData!: Item;

  addSingleItem = true;

  itemForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: [0.00, Validators.required],
    size: ['', Validators.required],
    sku: ['', Validators.required],
    datePurchased: [null],
    dateSold: [null],
    location: [''],
    quantity: [{ value: 1, disabled: true }]
  })

  sizeOptions = [
    'N/A',
    '7W',
    '8W',
    '9W',
    'M',
    '7M',
    '8M',
    '9M',
    '5Y',
    '6Y',
    '7Y',
    'S',
    'M',
    'L',
    'XL',
    'XXL'
  ]

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    if (this.action === 'Edit') {
      this.itemForm.patchValue({
        name: this.itemData['name'],
        price: this.itemData['price'],
        size: this.itemData['size'],
        sku: this.itemData['sku'],
        datePurchased: this.itemData['datePurchased'],
        dateSold: this.itemData['dateSold'],
        location: this.itemData['location'],
      })
    }
  }

  cancel() {
    return this.modalController.dismiss(null, 'Cancel')
  }

  confirm() {
    return this.modalController.dismiss(this.itemForm.getRawValue(), this.action)
  }

  toggleCheckbox() {
    const quantity = this.itemForm.controls['quantity']
    this.addSingleItem = !this.addSingleItem;

    if (!this.addSingleItem) {
      quantity.enable()
    } else {
      quantity.setValue(1)
      quantity.disable()
    }
  }
}
