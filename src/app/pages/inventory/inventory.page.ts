import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { InventoryService } from 'src/app/core/inventory/inventory.service';
import { Item, Items } from 'src/app/model/item';
import { CommonModule, SlicePipe } from '@angular/common';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [IonicModule, SlicePipe, CommonModule]
})
export class InventoryPage implements OnInit {
  private inventoryService = inject(InventoryService)
  items: Items[] = [];
  expanded: boolean[] = [];

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.items = this.inventoryService.getInventory();
    this.expanded = new Array(this.items.length).fill(false);
  }

  toggle(index: number) {
    this.expanded[index] = !this.expanded[index];
  }

  async openModal(firstIndex: number, slicedIndex: number | null, item: Item) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        itemName: item.name,
        itemPrice: item.price,
        itemSize: item.size,
        itemSku: item.sku,
        datePurchased: item.datePurchased,
        dateSold: item.dateSold,
        itemLocation: item.location,
      }
    });
    modal.present()

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (slicedIndex === null) {
        this.items[firstIndex][0] = { ...data };
      } else {
        const secondIndex = slicedIndex + 1
        this.items[firstIndex][secondIndex] = { ...data };
      }
    }
  }
}
