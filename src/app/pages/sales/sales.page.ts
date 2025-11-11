import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { InventoryService } from 'src/app/core/inventory/inventory.service';
import { Items } from 'src/app/model/item';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
  imports: [IonicModule]
})
export class SalesPage implements OnInit {
  private inventoryService = inject(InventoryService);
  items: Items[] = [];
  queriedInventory: Items[] = [];
  viewType = 'pending';
  
  constructor() { }

  ngOnInit() {
    this.items = this.inventoryService.getInventory();
    this.queriedInventory = this.items;
  }

  change(type: string) {
    this.viewType = type;
    console.log(this.viewType)
  }

}
