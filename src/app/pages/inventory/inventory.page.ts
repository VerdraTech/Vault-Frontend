import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonModal } from '@ionic/angular';
import { InventoryService } from 'src/app/core/inventory/inventory.service';
import { Item } from 'src/app/model/item';
import { FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule]
})
export class InventoryPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  private inventoryService = inject(InventoryService)
  private formBuilder = inject(FormBuilder);
  inventoryForm = this.buildInventoryForm()
  items!: Item[]

  constructor() { }

  ngOnInit() {
    this.items = this.inventoryService.getInventory();
    this.populateInventoryForm();
  }

  buildInventoryForm() {
    return this.formBuilder.group({
      inventory: this.formBuilder.array([])
    })
  }

  populateInventoryForm() {
    if (this.items.length > 0) {
      this.items.forEach(item => {
        const itemForm = this.buildItemForm(item)
        this.inventory.push(itemForm)
      })
    }
  }

  buildItemForm(item: any) {
    const itemForm =  this.formBuilder.group({
      id: [''],
      name: [''],
      price: [''],
      size: [''],
      sku: [''],
      datePurchased: [''],
      dateSold: [''],
      location: ['']
    })

    itemForm.patchValue({...item})
    return itemForm
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm(index: number) {
    console.log(this.inventory.controls[index].value)
    this.modal.dismiss(null, 'confirm');
  }

  get inventory() {
    return this.inventoryForm.controls['inventory'] as FormArray;
  }
}
