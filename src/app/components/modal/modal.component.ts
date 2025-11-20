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
    name: [{ value: '', disabled: false }],
    price: [null as null | number, Validators.required],
    size: ['', Validators.required],
    sku: [{ value: '', disabled: false }, Validators.required],
    datePurchased: [null as null | string],
    dateSold: [null as null | string],
    location: [''],
    quantity: [
      { value: 1, disabled: true },
      [Validators.required, Validators.min(1)],
    ],
    condition: ['', Validators.required],
  });

  sizeOptions = [
    'N/A',
    '8',
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
    'XXL',
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    if (this.action === 'Edit') {
      this.itemForm.patchValue({
        name: this.itemData.item['name'],
        price: this.itemData['acquisitionCost'],
        size: this.itemData['size'],
        sku: this.itemData.item['sku'],
        datePurchased: this.itemData.item['purchaseDate'],
        dateSold: this.itemData.item['sellDate'],
        location: this.itemData['location'],
        condition: this.itemData['condition'],
      });
    }
  }

  cancel() {
    return this.modalController.dismiss(null, 'Cancel');
  }

  confirm() {
    if (this.itemForm.valid && this.itemForm.dirty) {
      const formValue = this.itemForm.getRawValue();
      // Ensure quantity is set correctly
      if (this.addSingleItem) {
        formValue.quantity = 1;
      } else {
        // Ensure quantity is at least 1 for bulk add
        formValue.quantity = Math.max(1, Number(formValue.quantity) || 1);
      }
      return this.modalController.dismiss(formValue, this.action);
    } else if (this.itemForm.pristine) {
      return this.modalController.dismiss(null, 'Cancel');
    }
    return this.modalController.dismiss(null, 'Cancel');
  }

  toggleCheckbox() {
    const quantity = this.itemForm.controls['quantity'];
    this.addSingleItem = !this.addSingleItem;

    if (!this.addSingleItem) {
      // Bulk add enabled - enable quantity field
      quantity.enable();
      // Set default quantity to 1 if it's currently 1 or invalid
      if (!quantity.value || quantity.value < 1) {
        quantity.setValue(1);
      }
    } else {
      // Single item mode - disable quantity field and reset to 1
      quantity.setValue(1);
      quantity.disable();
    }
  }
}
