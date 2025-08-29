import { Injectable } from '@angular/core';
import { Item, Items } from 'src/app/model/item';
import mockInventory from 'src/app/mock-data/mock-inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor() { }

  getInventory() {
    let inv = this.groupBySku(mockInventory)
    return inv;
  }

  groupBySku(inventory: any) {
    if (inventory.length === 0) {
      return []
    }
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
        allItems.push(Object.assign([],sameItems))
        sameItems.length = 0;
      }
    }
    // edge case for when there's only one item
    if (sameItems.length === 1) {
      allItems.push(Object.assign([], sameItems))
    }
    return allItems;
  }
}
