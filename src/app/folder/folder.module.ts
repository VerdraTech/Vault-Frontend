import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';

import { FolderPage } from './folder.page';

import { InventoryPage } from '../pages/inventory/inventory.page';
import { MarketplacePage } from '../pages/marketplace/marketplace.page';
import { DashboardPage } from '../pages/dashboard/dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule,
    InventoryPage,
    MarketplacePage,
    DashboardPage
  ],
  declarations: [FolderPage]
})
export class FolderPageModule {}
