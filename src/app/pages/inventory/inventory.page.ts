import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonContent, IonFab, IonicModule, MenuController, ModalController } from '@ionic/angular';
import { InventoryService } from 'src/app/core/inventory/inventory.service';
import { Item, Items } from 'src/app/model/item';
import { CommonModule, SlicePipe } from '@angular/common';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import type { OverlayEventDetail } from '@ionic/core';
import { merge } from 'rxjs';

enum ModalMode {
  ADD = 'add',
  EDIT = 'edit'
}

type EditModalParams = {
  firstIndex: number,
  slicedIndex: number | null,
  item: Item,
  role: 'Edit',
}

type AddModalParams = {
  firstIndex: null,
  slicedIndex: null,
  item: null,
  role: 'Add'
}

type Filters = {
  key: string,
  value: string
}

type ModalParams = EditModalParams | AddModalParams;

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [IonicModule, SlicePipe, CommonModule, ReactiveFormsModule]
})
export class InventoryPage implements OnInit {
  private inventoryService = inject(InventoryService)
  private formBuilder = inject(FormBuilder)
  items: Items[] = [];
  expanded: boolean[] = [];
  searchForm = new FormControl('');
  filteredInventory: Items[] = [];
  filterForm = this.formBuilder.group({
    size: [''],
    listed: [''],
    location: ['']
  })

  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    }, 
    {
      text: 'Confirm',
      role: 'confirm',
    }
  ]
  sizeOptions = [
    'N/A',
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
    'XXL'
  ]

  inventoryCount!: number;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.items = this.inventoryService.getInventory();
    this.filteredInventory = this.items;
    this.expanded = new Array(this.items.length).fill(false);
    merge(
      this.filterForm.valueChanges,
      this.searchForm.valueChanges
    ).subscribe(() => {
      this.applyFilterAndSearch();
    })
    this.updateItemCount()
  }

  toggleAccordion(index: number) {
    this.expanded[index] = !this.expanded[index];
  }

  async openModal(params: ModalParams) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        action: params.role,
        itemData: params.item
      }
    });
    modal.present()

    const { data, role } = await modal.onWillDismiss();

    if (role === 'Edit' && params.firstIndex !== null) {
      this.updateItem(params.firstIndex, params.slicedIndex, data)
    } else if (role === 'Add') {
      this.addItem(data.quantity, data)
    }
  }

  async presentAlert(data: any, item: Item) {
    const alert = await this.alertController.create({
      header: 'Delete Item',
      message: `Are you sure you want to delete ${item.name}? This action is irreversible.`,
      buttons: this.alertButtons,
    });
    alert.present();

    const { role } = await alert.onWillDismiss();

    if (role === 'confirm') {
      this.deleteItem(data.firstIndex, data.slicedIndex, item);
    }
  }

  addItem(quantity: number, data: Item) {
    this.items.push([{...data}])
    if (quantity > 1) {
      for (let i = 0; i < quantity - 1; i++) {
        this.items[this.items.length - 1].push({...data})
      }
    }
    this.updateItemCount();
  }

  cloneItem(index: number, item: Item ) {
    this.items[index].push(item);
    if (!this.expanded[index]) this.toggleAccordion(index)

    this.updateItemCount();
  }

  updateItem(firstIndex: number, slicedIndex: number | null, data: Item) {
    if (slicedIndex === null) {
      // update first item of the accordion
      this.items[firstIndex][0] = { ...data };
    } else {
      const secondIndex = slicedIndex + 1
      this.items[firstIndex][secondIndex] = { ...data };
    }
  }

  deleteItem(firstIndex: number, slicedIndex: number | null, data: Item) {
    if (slicedIndex === null) {
      // delete first item of the accordion
      this.items[firstIndex].splice(0, 1);
      if (this.items[firstIndex].length === 0) {
        this.items.splice(firstIndex, 1)
      }
    } else {
      const secondIndex = slicedIndex + 1
      this.items[firstIndex][secondIndex] = { ...data };
      this.items[firstIndex].splice(secondIndex, 1);
    }
    this.updateItemCount();
  }

  updateItemCount() {
    this.inventoryCount = this.items.flat(Infinity).length;
  }

  applySearch(queryValue: string | null, items: any) {
    let matchingResults: Item[] = [];

    items.forEach((item:any) => {
      const matchesSearch = item.name.toLowerCase().includes(queryValue?.toLowerCase() || '');
      if (matchesSearch) {
        matchingResults.push(item)
      }
    });
  
    if (matchingResults.length === 0) {
      return []
    }
    return matchingResults;
  }

  applyFilter(selectedFilters: Filters[]) {
    let filterResults: Item[] = [];

    this.items.forEach(itemArray => {
       itemArray.filter(item => {
        const matchesFilters = selectedFilters.every((obj) => {
          if (item[obj.key] === obj.value) {
            return true
          }
          return false
        })
        if (matchesFilters) {
          filterResults.push(item)
        }
       })
     })
     return filterResults;
  }

  applyFilterAndSearch() {
    const queryValue = this.searchForm.getRawValue()
    const filterValues = this.filterForm.getRawValue()
    const selectedFilters = Object.entries(filterValues)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({ key, value }))

    const filteredItems = this.applyFilter(selectedFilters as [{ key: string, value: string }])
    const result = this.applySearch(queryValue, filteredItems)
    this.filteredInventory = this.inventoryService.groupBySku(result)
  }

  removeFilter(filterOption: string) {
    this.filterForm.get(filterOption)?.reset('')
  }
}
