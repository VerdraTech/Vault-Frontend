import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { map, Observable } from 'rxjs';
import { InventoryService } from 'src/app/core/inventory/inventory.service';
import { Items } from 'src/app/model/item';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class SalesPage implements OnInit {
  private inventoryService = inject(InventoryService);
  items!: Observable<any>;
  queriedInventory!: Observable<any>;
  viewType = 'pending';
  
  constructor() { }

  ngOnInit() {
    this.items = this.inventoryService.getSalesInventory();
    this.queriedInventory = this.items.pipe(
      map((response) => {
        console.log(response)
        return response.items;
      })
    );
  }

  change(type: string) {
    this.viewType = type;
    console.log(this.viewType)
  }

}
