import { inject, Injectable } from '@angular/core';
import { Item, Items } from 'src/app/model/item';
import mockInventory from 'src/app/mock-data/mock-inventory';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService)
  inventoryURL = 'https://localhost:8000/api/inventory'

  constructor() { }

  getUserInventory(): Observable<Items[]> {
    return this.http.get<any>(`${this.inventoryURL}/user/${this.authService.currentUser}?page=1&size=100`, { withCredentials: true }).pipe(
      map((response) => {
        let items =  this.groupBySku(response.items)
        return items;
      })
    )
  }

  getAllInventory() {
    return this.http.get<any>(`${this.inventoryURL}/all`,
      { withCredentials: true }
    ).subscribe((response) => {
      console.log(response)
    })
  }

  updateItem(data: any, id: string) { // modify item
    this.http.put(`${this.inventoryURL}/${id}`, {
      size: data.size,
      condition: data.condition,
      acquisition_cost: data.price,
      // price: data.price,
      location: data.location,
      listed: data.listed
    }, {
      withCredentials: true
    }).subscribe((response) => {
      console.log('UPDATE', response)
      return response
    })
  }

  deleteItem(id: string) { // delete from inventory
    return this.http.delete<any>(`${this.inventoryURL}/${id}`, 
      { withCredentials: true }
    ).subscribe((response) => {
      console.log('DELETE', response)
    })
  }

  addItem(quantity: number, data: any) { // add item to inventory
    const headers = new HttpHeaders({
      'X-CSRF-Token': ''
    });
    return this.http.post<any>(this.inventoryURL, {
      user_id: this.authService.currentUser,
      item_id: 'fd993584-e7b5-4242-8b32-fea0e20bf50a', // update after SKU change
      size: data.size,
      condition: data.condition,
      acquisition_cost: data.acquisitionCost,
      location: data.location
    }, { withCredentials: true }).subscribe((response) => {
      console.log('ADD', response)
      return response
    })
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
        sameItems.push(this.dataMapper(item))
        continue;
      }

      if (sameItems[0]['item']['sku'] === item['item']['sku']) {
        sameItems.push(this.dataMapper(item))
      } else {
        allItems.push(Object.assign([], sameItems))
        sameItems.length = 0;
        sameItems.push(this.dataMapper(item))
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

  dataMapper(data: any): Item {
    return {
      id: data.id,
      condition: data.condition,
      acquisitionCost: data.acquisition_cost,
      createdAt: data.created_at,
      item: {
        createdAt: data.item.created_at,
        forSale: data.item.for_sale,
        id: data.item.id,
        name: data.item.name,
        ownerId: data.item.owner_id,
        purchaseDate: data.item.purchase_date,
        sellDate: data.item.sell_date,
        sku: data.item.sku
      },
      itemId: data.item_id,
      listed: data.listed,
      location: data.location,
      quantity: data.quantity,
      size: data.size,
      userId: data.user_id,
    }
  }
}
