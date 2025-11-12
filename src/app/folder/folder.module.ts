import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';

import { FolderPage } from './folder.page';

import { InventoryPage } from '../pages/inventory/inventory.page';
import { DashboardPage } from '../pages/dashboard/dashboard.page';
import { SalesPage } from '../pages/sales/sales.page';
import { ShippingPage } from '../pages/shipping/shipping.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule,
    InventoryPage,
    DashboardPage,
    SalesPage,
    ShippingPage
  ],
  declarations: [FolderPage]
})
export class FolderPageModule {}
