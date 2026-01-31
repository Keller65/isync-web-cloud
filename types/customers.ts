export interface CustomerType {
  cardCode: string;
  cardName: string;
  federalTaxID: string;
  priceListNum: number;
}

export interface CustomerResponseType {
  page: number;
  pageSize: number;
  items: CustomerType[];
  total: number | null;
}
