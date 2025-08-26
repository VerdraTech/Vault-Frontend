import { Injectable } from '@angular/core';
import { Item, Items } from 'src/app/model/item';
import mockInventory from 'src/app/mock-data/mock-inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  tempInventory: Items[] = [];
  constructor() { }

  getInventory() {
    let inv = this.groupBySku(this.tempInventory)
    return inv;
  }

  groupBySku(inventory: any) {
    let allItems: Items[] = [];
    let sameItems: Item[] = [];

    // data received from db should be sorted
    for (let i = 0; i < inventory.length; i++) {
      let item = inventory[i]
      if (sameItems.length === 0) {
        sameItems.push(item)
        continue;
      }

      if (sameItems[0]['sku'] === item['sku']) {
        sameItems.push(item)
      } else {
        allItems.push(Object.assign([], sameItems))
        sameItems.length = 0;
        sameItems.push(item)
      }

      if (i === inventory.length - 1) {
        allItems.push(sameItems)
      }
    }

    return allItems;
  }

  csvImport(data: any) {
    data.map((item: Item) => {
      this.tempInventory.push([{...item}])
    })
    return this.tempInventory;
  }
}
