import { inject, Injectable } from '@angular/core';
import { Item, Items } from 'src/app/model/item';
import mockInventory from 'src/app/mock-data/mock-inventory';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  map,
  Observable,
  filter,
  take,
  switchMap,
  BehaviorSubject,
  tap,
} from 'rxjs';
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

  // Cache for current inventory state
  private inventoryCache$ = new BehaviorSubject<{
    items: Items[];
    total: number;
  } | null>(null);

  constructor() {}

  getUserInventory(
    forceRefresh = false
  ): Observable<{ items: Items[]; total: number }> {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && this.inventoryCache$.value) {
      return this.inventoryCache$.asObservable() as Observable<{
        items: Items[];
        total: number;
      }>;
    }

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
        const result = { items: items, total: response.total };
        // Update cache
        this.inventoryCache$.next(result);
        return result;
      })
    );
  }

  /**
   * Get cached inventory without making a request
   */
  getCachedInventory(): { items: Items[]; total: number } | null {
    return this.inventoryCache$.value;
  }

  /**
   * Invalidate cache to force refresh on next request
   */
  invalidateCache(): void {
    this.inventoryCache$.next(null);
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

  updateItem(data: any, id: string): Observable<any> {
    // Build update request body according to InventoryUpdate schema
    // Can update: inventory fields (size, condition, etc.) AND Item fields (name, sku)
    const requestBody: any = {};
    const cachedInventory = this.inventoryCache$.value;

    // Check if SKU or name is changing (requires full refresh due to grouping)
    const skuChanging = data.sku !== null && data.sku !== undefined;
    const nameChanging = data.name !== null && data.name !== undefined;
    const needsFullRefresh = skuChanging || nameChanging;

    // Inventory fields
    if (data.size !== null && data.size !== undefined) {
      requestBody.size = data.size;
    }
    if (data.condition !== null && data.condition !== undefined) {
      requestBody.condition = data.condition;
    }
    if (data.acquisitionCost !== null && data.acquisitionCost !== undefined) {
      requestBody.acquisition_cost = Number(data.acquisitionCost);
    } else if (data.price !== null && data.price !== undefined) {
      requestBody.acquisition_cost = Number(data.price);
    }
    if (data.location !== null && data.location !== undefined) {
      requestBody.location = data.location;
    }
    if (data.listed !== null && data.listed !== undefined) {
      requestBody.listed = Boolean(data.listed);
    }
    // Handle dates - convert empty strings to null, and ensure proper format
    if (
      data.datePurchased !== null &&
      data.datePurchased !== undefined &&
      data.datePurchased !== ''
    ) {
      // ion-datetime returns ISO date string, backend expects datetime
      requestBody.purchase_date = data.datePurchased;
    } else {
      // Explicitly set to null if empty/undefined
      requestBody.purchase_date = null;
    }
    if (
      data.dateSold !== null &&
      data.dateSold !== undefined &&
      data.dateSold !== ''
    ) {
      requestBody.sell_date = data.dateSold;
    } else {
      // Explicitly set to null if empty/undefined
      requestBody.sell_date = null;
    }

    // Item fields (name and SKU)
    if (data.name !== null && data.name !== undefined) {
      requestBody.name = data.name;
    }
    if (data.sku !== null && data.sku !== undefined) {
      requestBody.sku = data.sku;
    }

    // Optimistic update for non-grouping changes
    if (!needsFullRefresh && cachedInventory) {
      this.updateItemInCache(id, requestBody);
    }

    return this.http
      .put(`${this.inventoryURL}/${id}`, requestBody, {
        withCredentials: true,
      })
      .pipe(
        tap({
          next: () => {
            // Invalidate cache if SKU/name changed (requires regrouping)
            if (needsFullRefresh) {
              this.invalidateCache();
            }
          },
          error: () => {
            // On error, revert optimistic update
            if (!needsFullRefresh && cachedInventory) {
              this.inventoryCache$.next(cachedInventory);
            }
          },
        })
      );
  }

  /**
   * Optimistically update item in cache
   */
  private updateItemInCache(id: string, updates: any): void {
    const cached = this.inventoryCache$.value;
    if (!cached) return;

    const updatedItems = cached.items.map((group) =>
      group.map((item) => {
        if (item.id === id) {
          const updated = { ...item };
          // Update inventory fields
          if (updates.size !== undefined) updated.size = updates.size;
          if (updates.condition !== undefined)
            updated.condition = updates.condition;
          if (updates.acquisition_cost !== undefined)
            updated.acquisitionCost = updates.acquisition_cost;
          if (updates.location !== undefined)
            updated.location = updates.location;
          if (updates.listed !== undefined) updated.listed = updates.listed;
          // Dates are on the inventory level, but stored in item object for display
          if (updates.purchase_date !== undefined) {
            updated.item = { ...updated.item };
            updated.item.purchaseDate = updates.purchase_date;
          }
          if (updates.sell_date !== undefined) {
            updated.item = { ...updated.item };
            updated.item.sellDate = updates.sell_date;
          }
          return updated;
        }
        return item;
      })
    );

    this.inventoryCache$.next({ items: updatedItems, total: cached.total });
  }

  deleteItem(id: string): Observable<any> {
    const cachedInventory = this.inventoryCache$.value;

    // Optimistic delete
    if (cachedInventory) {
      this.deleteItemFromCache(id);
    }

    return this.http
      .delete<any>(`${this.inventoryURL}/${id}`, {
        withCredentials: true,
      })
      .pipe(
        tap({
          error: () => {
            // On error, revert optimistic delete
            if (cachedInventory) {
              this.inventoryCache$.next(cachedInventory);
            }
          },
        })
      );
  }

  /**
   * Optimistically delete item from cache
   */
  private deleteItemFromCache(id: string): void {
    const cached = this.inventoryCache$.value;
    if (!cached) return;

    const updatedItems: Items[] = [];
    let total = cached.total;

    cached.items.forEach((group) => {
      const filteredGroup = group.filter((item) => item.id !== id);
      if (filteredGroup.length > 0) {
        updatedItems.push(filteredGroup);
      } else {
        // Group is empty, don't add it (item was the only one in group)
        total -= 1;
      }
      if (filteredGroup.length < group.length) {
        // Item was removed from this group
        total -= 1;
      }
    });

    this.inventoryCache$.next({ items: updatedItems, total });
  }

  addItem(quantity: number, data: any): Observable<any> {
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
    // Handle dates - convert empty strings to null
    if (
      data.datePurchased !== null &&
      data.datePurchased !== undefined &&
      data.datePurchased !== ''
    ) {
      requestBody.purchase_date = data.datePurchased;
    } else {
      requestBody.purchase_date = null;
    }
    if (
      data.dateSold !== null &&
      data.dateSold !== undefined &&
      data.dateSold !== ''
    ) {
      requestBody.sell_date = data.dateSold;
    } else {
      requestBody.sell_date = null;
    }

    // For add, we need full refresh because new item might group with existing SKU
    // or create new group, so we invalidate cache and let the response refresh
    return this.http
      .post<any>(this.inventoryURL, requestBody, {
        withCredentials: true,
      })
      .pipe(
        tap({
          next: () => {
            // Invalidate cache - new item might affect grouping
            this.invalidateCache();
          },
        })
      );
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
        // Dates are on the inventory level, not item level
        purchaseDate: data.purchase_date || null,
        sellDate: data.sell_date || null,
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
