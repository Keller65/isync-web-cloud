export interface OrderLineType {
  itemCode: string;
  itemDescription: string;
  barCode: string;
  quantity: number;
  priceAfterVAT: number;
  priceList: number;
  taxCode: string;
}

export interface OrderDetailType {
  docEntry: number;
  docNum: number;
  cardCode: string;
  cardName: string;
  federalTaxID: string;
  address: string;
  docDate: string;
  vatSum: number;
  docTotal: number;
  comments: string;
  salesPersonCode: number;
  priceListNum: number;
  lines: OrderLineType[];
}

export interface OrderDataType {
  docEntry: number;
  docNum: number;
  cardCode: string;
  cardName: string;
  federalTaxID: string;
  address: string;
  docDate: string;
  vatSum: number;
  docTotal: number;
  comments: string;
  salesPersonCode: number;
  priceListNum: number;
  lines: OrderLineType[];
}
