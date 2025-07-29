export interface Item {
  id?: number;
  name?: string;
  price?: number;
  size?: string;
  SKU?: string;
  datePurchased?: string;
  dateSold?: string | null;
  location?: string;
}