export interface Item {
  [key: string | number]: any;
  id: string;
  acquisitionCost: number;
  condition: string;
  createdAt: string;
  item: {
    createdAt: string;
    forSale: boolean;
    id: string;
    name: string;
    ownerId: string;
    purchaseDate: string | null;
    sellDate: string | null;
    sku: string;
  }
  itemId: string;
  listed: boolean;
  location: string;
  quantity: number;
  size: string;
  userId: string;
}

export interface Items extends Array<Item> {

}