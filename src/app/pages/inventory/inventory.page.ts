import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonContent,
  IonFab,
  IonicModule,
  MenuController,
  ModalController,
} from '@ionic/angular';
import { InventoryService } from 'src/app/core/inventory/inventory.service';
import { Item, Items } from 'src/app/model/item';
import { CommonModule, SlicePipe } from '@angular/common';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, merge, Observable } from 'rxjs';
import * as Papa from 'papaparse'
import type { OverlayEventDetail } from '@ionic/core';

enum ModalMode {
  ADD = 'add',
  EDIT = 'edit',
}

type EditModalParams = {
  item: Item;
  role: 'Edit';
};

type AddModalParams = {
  item: null;
  role: 'Add';
};

type Filters = {
  key: string;
  value: string;
};

type ModalParams = EditModalParams | AddModalParams;

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [IonicModule, SlicePipe, CommonModule, ReactiveFormsModule],
})
export class InventoryPage implements OnInit {
  private inventoryService = inject(InventoryService);
  private formBuilder = inject(FormBuilder);
  items = [];
  items$!: Observable<{ items: Items[]; total: number }>;
  expanded: boolean[] = [];
  searchForm = new FormControl('');
  filteredInventory$!: Observable<Items[]>;
  filterForm = this.formBuilder.group({
    itemName: [''],
    size: [''],
    listed: [''],
    location: [''],
  });

  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Confirm',
      role: 'confirm',
    },
  ];
  sizeOptions = [
    'N/A',
    '8',
    '7W',
    '8W',
    '9W',
    'M',
    '7M',
    '8M',
    '9M',
    '5Y',
    '6Y',
    '7Y',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
  ];

  inventoryCount!: number;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.items$ = this.inventoryService.getUserInventory();
    this.inventoryService.getUserInventory().subscribe((response) => {
      console.log('test', response)
    })
    this.filteredInventory$ = this.items$.pipe(
      map((response: any) => {
        this.inventoryCount = response.total;
        return response.items;
      })
    );
    this.expanded = new Array(this.items.length).fill(false);

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilterAndSearch();
    });
    this.searchForm.valueChanges.subscribe(() => {
      //this.applySearch();
    })
  }

  toggleAccordion(index: number) {
    this.expanded[index] = !this.expanded[index];
  }

  async openModal(params: any) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        action: params.role,
        itemData: params.item,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    // If modal was canceled or data is null, don't proceed
    if (!data || role === 'Cancel') {
      return;
    }

    data.acquisitionCost = Number(data.price);
    if (role === 'Edit') {
      this.updateItem(data, params.item['id']);
    } else if (role === 'Add') {
      this.addItem(data.quantity, data);
    }
  }

  async presentAlert(item: Item) {
    const alert = await this.alertController.create({
      header: 'Delete Item',
      message: `Are you sure you want to delete ${item.item['name']}? This action is irreversible.`,
      buttons: this.alertButtons,
    });
    alert.present();

    const { role } = await alert.onWillDismiss();

    if (role === 'confirm') {
      this.deleteItem(item.id);
    }
  }

  // cloneItem(index: number, item: Item ) {
  //   this.items[index].push(item);
  //   if (!this.expanded[index]) this.toggleAccordion(index)
  // }

  addItem(quantity: number, data: any) {
    this.inventoryService.addItem(quantity, data).subscribe({
      next: (response) => {
        console.log('Item added successfully:', response);
        // Refresh to get updated grouping (new item might group with existing SKU)
        this.refreshInventory(true);
      },
      error: (error) => {
        console.error('Error adding item:', error);
        // Refresh on error to ensure consistency
        this.refreshInventory(true);
      },
    });
  }

  removeFilter(filterOption: string) {
    this.filterForm.get(filterOption)?.reset('');
  }

  deleteItem(id: any) {
    this.inventoryService.deleteItem(id).subscribe({
      next: (response) => {
        console.log('Item deleted successfully:', response);
        // Optimistic delete already updated UI, but refresh to ensure consistency
        // (in case item was last in a group, etc.)
        this.refreshInventory();
      },
      error: (error) => {
        console.error('Error deleting item:', error);
        // Refresh on error to revert optimistic delete
        this.refreshInventory(true);
      },
    });
  }

  updateItem(data: any, id: string) {
    const skuChanging = data.sku !== null && data.sku !== undefined;
    const nameChanging = data.name !== null && data.name !== undefined;
    const needsFullRefresh = skuChanging || nameChanging;

    this.inventoryService.updateItem(data, id).subscribe({
      next: (response) => {
        console.log('Item updated successfully:', response);
        // Only refresh if SKU/name changed (affects grouping)
        // Otherwise, optimistic update already handled it
        if (needsFullRefresh) {
          this.refreshInventory(true);
        }
      },
      error: (error) => {
        console.error('Error updating item:', error);
        if (error.status === 422 && error.error?.detail) {
          console.error('Validation errors:', error.error.detail);
        }
        // Refresh to revert optimistic update on error
        this.refreshInventory(true);
      },
    });
  }

  refreshInventory(forceRefresh = false) {
    // Refresh the inventory list, respecting any active filters
    const filterValues = this.filterForm.getRawValue();
    const hasActiveFilters = Object.values(filterValues).some(
      (value) => value !== null && value !== undefined && value !== ''
    );

    if (hasActiveFilters) {
      // If filters are active, refresh with filters applied
      this.applyFilterAndSearch();
    } else {
      // Otherwise, refresh the full inventory list (with cache if available)
      this.items$ = this.inventoryService.getUserInventory(forceRefresh);
      this.filteredInventory$ = this.items$.pipe(
        map((response: any) => {
          this.inventoryCount = response.total;
          return response.items;
        })
      );
    }
  }

  applyFilterAndSearch() {
    const filterValues = this.filterForm.getRawValue();
    this.filteredInventory$ = this.inventoryService
      .getFilteredUserInventory(filterValues)
      .pipe(
        map((response: any) => {
          this.inventoryCount = response.total;
          return response.items;
        })
      );
      
  }
  
  onFileSelected(event: any): Items[] {
    const file: File = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const csvImportData = this.mapCsvData(result.data)
          this.inventoryService.csvImport(csvImportData)
        }
      })
    }
    return [];
  }

  mapCsvData(data: any): Items[] {
    const items = data.map((row: any) => ({
      id: row?.['ID'],
      name: row['Item Name'],
      sku: row?.['SKU'],
      price: (row['Price'] || row['Cost']),
      size: row['Size'],
      location: row?.['Location'],
      datePurchased: row?.['Purchase Date'],
      dateSold: row?.['Sold Date'],
      condition: row?.['Condition']
    }));

    return items;
  }
}
