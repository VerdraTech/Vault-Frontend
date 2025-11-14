import { inject, Injectable } from '@angular/core';
import { Item, Items } from 'src/app/model/item';
import mockInventory from 'src/app/mock-data/mock-inventory';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable, filter, take, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { EnvResolverService } from '../env-resolver/env-resolver.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private envService = inject(EnvResolverService);
  apiURL = this.envService.apiUrl;
  inventoryURL = `${this.apiURL}/api/inventory`;
  constructor() {}

  getUserInventory(): Observable<{ items: Items[]; total: number }> {
    // Wait for user to be authenticated and currentUser to be set
    // Check both loggedIn status and currentUser availability
    return this.authService.loggedIn$.pipe(
      filter((isLoggedIn) => {
        // Only proceed if logged in AND currentUser is set
        return isLoggedIn && !!this.authService.currentUser;
      }),
      take(1),
      switchMap(() => {
        const userId = this.authService.currentUser;
        if (!userId) {
          throw new Error('User ID not available');
        }
        return this.http.get<any>(
          `${this.inventoryURL}/user/${userId}?page=1&size=100`,
          { withCredentials: true }
        );
      }),
      map((response) => {
        let items = this.groupBySku(response.items);
        return { items: items, total: response.total };
      })
    );
  }

  getFilteredUserInventory(
    filters: {},
    page = 1,
    size = 25
  ): Observable<{ items: Items[]; total: number }> {
    // Wait for user to be authenticated and currentUser to be set
    return this.authService.loggedIn$.pipe(
      filter((isLoggedIn) => {
        // Only proceed if logged in AND currentUser is set
        return isLoggedIn && !!this.authService.currentUser;
      }),
      take(1),
      switchMap(() => {
        const userId = this.authService.currentUser;
        if (!userId) {
          throw new Error('User ID not available');
        }
        let params = new HttpParams()
          .set('page', page.toString())
          .set('size', size.toString());

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            const snakeCaseKey = this.filterMapper(key);
            params = params.set(snakeCaseKey, value.toString());
          }
        });
        return this.http.get<any>(`${this.inventoryURL}/user/${userId}`, {
          params,
          withCredentials: true,
        });
      }),
      map((response) => {
        let items = this.groupBySku(response);
        return { items: items, total: response.total };
      })
    );
  }

  getAllInventory() {
    return this.http.get<any>(`${this.apiURL}/all?page=1&size=100`, {
      withCredentials: true,
    });
  }

  getAllProd() {
    return this.http.get<any>(`${this.inventoryURL}/all`, {
      withCredentials: true,
    });
  }

  updateItem(data: any, id: string) {
    // modify item
    this.http
      .put(
        `${this.inventoryURL}/${id}`,
        {
          size: data.size,
          condition: data.condition,
          acquisition_cost: data.price,
          // price: data.price,
          location: data.location,
          listed: data.listed,
        },
        {
          withCredentials: true,
        }
      )
      .subscribe((response) => {
        console.log('UPDATE', response);
        return response;
      });
  }

  deleteItem(id: string) {
    // delete from inventory
    return this.http
      .delete<any>(`${this.inventoryURL}/${id}`, { withCredentials: true })
      .subscribe((response) => {
        console.log('DELETE', response);
      });
  }

  addItem(quantity: number, data: any) {
    // Ensure CSRF token is available before making the request
    // The interceptor will add it automatically, but we need to make sure it's fetched
    if (!this.authService.getCsrfToken()) {
      console.warn('CSRF token not available, fetching...');
      this.authService.fetchCsrfToken().subscribe();
    }

    // Build request body according to InventoryCreate schema
    // Backend expects: name (required), sku (optional), size (required), condition (required),
    // acquisition_cost (optional), location (optional), listed (optional, defaults to false)
    const requestBody: any = {
      name: data.name, // Required - product name
      size: data.size, // Required - shoe size
      condition: data.condition, // Required - condition (new, used, etc.)
    };

    // Optional fields
    if (data.sku) {
      requestBody.sku = data.sku; // Optional - SKU (will be auto-populated if not provided)
    }
    if (data.acquisitionCost !== null && data.acquisitionCost !== undefined) {
      requestBody.acquisition_cost = Number(data.acquisitionCost);
    } else if (data.price !== null && data.price !== undefined) {
      requestBody.acquisition_cost = Number(data.price);
    }
    if (data.location) {
      requestBody.location = data.location;
    }
    if (data.listed !== null && data.listed !== undefined) {
      requestBody.listed = Boolean(data.listed);
    }

    return this.http
      .post<any>(this.inventoryURL, requestBody, { withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('ADD', response);
          return response;
        },
        error: (error) => {
          console.error('Error adding item:', error);
          // Log validation errors for debugging
          if (error.status === 422 && error.error?.detail) {
            console.error('Validation errors:', error.error.detail);
          }
          // If CSRF error, try to fetch token and retry
          if (
            error.status === 403 &&
            error.error?.detail === 'CSRF check failed'
          ) {
            console.log('CSRF error detected, fetching new token...');
            this.authService.fetchCsrfToken().subscribe(() => {
              console.log('CSRF token refreshed, please try again');
            });
          }
        },
      });
  }

  groupBySku(data: any) {
    if (data.length === 0) {
      return [];
    }
    let allItems: Items[] = [];
    let sameItems: Item[] = [];

    // data received from db should be sorted
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (sameItems.length === 0) {
        sameItems.push(this.itemMapper(item));
        continue;
      }

      if (sameItems[0]['item']['sku'] === item['item']['sku']) {
        sameItems.push(this.itemMapper(item));
      } else {
        allItems.push(Object.assign([], sameItems));
        sameItems.length = 0;
        sameItems.push(this.itemMapper(item));
      }

      if (i === data.length - 1) {
        allItems.push(Object.assign([], sameItems));
        sameItems.length = 0;
      }
    }
    // edge case for when there's only one item
    if (sameItems.length === 1) {
      allItems.push(Object.assign([], sameItems));
    }
    return allItems;
  }

  itemMapper(data: any): Item {
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
        sku: data.item.sku,
      },
      itemId: data.item_id,
      listed: data.listed,
      location: data.location,
      quantity: data.quantity,
      size: data.size,
      userId: data.user_id,
    };
  }

  filterMapper(key: any) {
    switch (key) {
      case 'size':
        return 'size_filter';
      case 'itemName':
        return 'item_name';
      default:
        return key;
    }
  }
}
