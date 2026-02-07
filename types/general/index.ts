export interface Invoice {
  invoiceDocEntry: number;
  invoiceDocNum: number;
  invoiceDate: string;
  numAtCard: string;
  docTotal: number;
  appliedAmount: number;
  // Add any other properties of invoice if they exist in the data
}

export interface PaymentDetail {
  bankCode: string | null;
  cardCreditSum: number | null;
  cardVoucherNum: string | null;
  checkNumber: string | null;
  checkSum: number | null;
  dueDate: string | null;
  transferAccountName: string;
  transferDate: string;
  transferReference: string;
}

export interface Payment {
  cancelled: string;
  cardCode: string;
  cardName: string;
  cash: number;
  check: number;
  credit: number;
  docDate: string;
  docEntry: number;
  docNum: number;
  invoices: Invoice[];
  payment: PaymentDetail[];
  paymentMeans: string;
  total: number;
  transfer: number;
}
