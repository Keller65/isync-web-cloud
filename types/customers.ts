export interface CustomerAddress {
  rowNum: number;
  addressName: string;
  addressType: string;
  bpCode: string;
  street: string;
  country: string;
  state: string;
  stateName: string;
  u_Ciudad: string;
  ciudadName: string;
  u_Latitud: string;
  u_Longitud: string;
}

export interface CustomerType {
  cardCode: string;
  cardName: string;
  federalTaxID: string;
  priceListNum: number;
  address?: string | [];
}

export interface CustomerResponseType {
  page: number;
  pageSize: number;
  items: CustomerType[];
  total: number | null;
}
