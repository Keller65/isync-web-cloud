export type Tier = {
  qty: number;
  price: number;
  percent: number;
  expiry: string;
};

export type WarehouseStock = {
  warehouseName: string;
  inStock: number;
};

export type Product = {
  itemCode: string;
  itemName: string;
  groupCode: number | string;
  groupName: string;
  inStock: number;
  committed: number;
  ordered: number;
  price: number;
  hasDiscount: boolean;
  taxType: string;
  taxCode: string;
  barCode?: string | null;
  salesUnit: string | null;
  salesItemsPerUnit: number;
  imageUrl?: string | null;
  tiers: Tier[];
  quantity?: number;
  unitPrice?: number;
  originalPrice?: number;
  categoryCode?: string;
  pricingSource?: "GeneralSpecialPrice" | "CustomerSpecialPrice";
  ws: WarehouseStock[];
};