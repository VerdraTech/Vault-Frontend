export interface Item {
  id?: number;
  name?: string;
  price?: number;
  size?: string;
  sku?: string;
  datePurchased?: string;
  dateSold?: string | null;
  location?: string;
}

export interface Items extends Array<Item> {
  
}