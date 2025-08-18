export interface Item {
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