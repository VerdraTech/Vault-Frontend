import { Injectable } from '@angular/core';
import { Item } from 'src/app/model/item';
import mockInventory from 'src/app/mock-data/mock-inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor() { }

  getInventory() {
    return mockInventory;
  }
}
