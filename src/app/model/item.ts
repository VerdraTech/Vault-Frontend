//export interface Item {
//  [key: string | number]: any;
//  id?: number;
//  name: string;
//  price: number;
//  size: string;
//  sku: string;
//  datePurchased?: any;
//  dateSold?: any;
//  location?: string;
//}

export interface Item {
  [key: string | number]: any;
  acquisition_cost: number;
  condition: string;
  created_at: string;
  item: {
    created_at: string;
    for_sale: boolean;
    id: string;
    name: string;
    owner_id: string;
    purchase_date: string | null;
    sell_date: string | null;
    sku: string;
  }
  item_id: string;
  listed: boolean;
  location: string;
  quantity: number;
  size: number | string;
  user_id: string;
}

export interface Items extends Array<Item> {
  
}