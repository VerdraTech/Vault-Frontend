export interface Item {
  [key: string | number]: any;
  id?: number;
  name: string;
  price: number;
  size: string;
  sku: string;
  datePurchased?: any;
  dateSold?: any;
  location?: string;
}

export interface Items extends Array<Item> {
  
}