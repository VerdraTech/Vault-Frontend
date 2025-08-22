import { inject, Injectable } from '@angular/core';
import { Item, Items } from 'src/app/model/item';
import mockInventory from 'src/app/mock-data/mock-inventory';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  constructor() { }

  getInventory(): Observable<Items[]> {
    return this.http.get<any>('https://localhost:8000/api/inventory/all', { withCredentials: true }).pipe(
      map((response) => {
        let items =  this.groupBySku(response.items)
        return items;
      })
    )
  }

  //groupBySku(inventory: any) {
  //  if (inventory.length === 0) {
  //    return []
  //  }
  //  let allItems: Items[] = [];
  //  let sameItems: Item[] = [];
//
  //  // data received from db should be sorted
  //  for (let i = 0; i < inventory.length; i++) {
  //    let item = inventory[i]
  //    if (sameItems.length === 0) {
  //      sameItems.push(item)
  //      continue;
  //    }
//
  //    if (sameItems[0]['sku'] === item['sku']) {
  //      sameItems.push(item)
  //    } else {
  //      allItems.push(Object.assign([], sameItems))
  //      sameItems.length = 0;
  //      sameItems.push(item)
  //    }
//
  //    if (i === inventory.length - 1) {
  //      allItems.push(Object.assign([],sameItems))
  //      sameItems.length = 0;
  //    }
  //  }
  //  // edge case for when there's only one item
  //  if (sameItems.length === 1) {
  //    allItems.push(Object.assign([], sameItems))
  //  }
  //  return allItems;
  //}

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

      if (sameItems[0]['item']['sku'] === item['item']['sku']) {
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
